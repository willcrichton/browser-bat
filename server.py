#!/usr/bin/env python2

from flask    import *
from urlparse import urlparse
from scrape   import *
import json
import os
import sqlite3
import operator
import platform
import time
import datetime

app = Flask(__name__)

@app.route('/')
def index():
    if not os.path.exists(DB_DIR): return redirect(url_for('analyze'))

    db = sqlite3.connect(DB_DIR + '/' + DB_NAME).cursor()
    browser_data = {}

    # find most visited sites
    urls = {}
    for row in db.execute('SELECT url FROM visits'):
        url = urlparse(row[0])
        if not url.netloc in urls:
            urls[url.netloc] = 0
        urls[url.netloc] += 1

    browser_data['sites'] = sorted(urls.iteritems(), key=operator.itemgetter(1), reverse=True)

    query = 'SELECT count(*), visit_time, datetime(visit_time, "unixepoch") AS d FROM visits GROUP BY strftime("%Y%j", d)'
    num_visits = []
    for row in db.execute(query):
        num_visits.append(row)

    browser_data['histogram'] = num_visits
    browser_data['user'] = os.environ['USERNAME' if platform.system() == 'Windows' else 'USER']

    downloads = []
    for (path,) in db.execute('SELECT path FROM downloads'):
        downloads.append({'path': path, 'name': os.path.basename(path)})
    
    browser_data['downloads'] = downloads

    scrapers = [s() for s in SCRAPERS if s().ready]
    config = [{'path': s.config_path(platform.system(), platform.release())[1],
               'name': s.name} for s in scrapers]

    # load analysis here
    return render_template('index.jinja2', data=json.dumps(browser_data),
                           config=config)

@app.route('/analyze')
def analyze():
    ret = do_scrape()
    if not ret[0]:
        raise Exception(ret[1])

    return redirect(url_for('index'))

@app.route('/query')
def query():
    db = sqlite3.connect(DB_DIR + '/' + DB_NAME).cursor()
    query = db.execute(request.args['q'])
    output = [row for row in query]
    return json.dumps(output, indent=4, separators=(',', ': '))

@app.route('/report')
def report():
    db = sqlite3.connect(DB_DIR + '/' + DB_NAME).cursor()

    # data request from DataTables
    if request.args.get('_'):
        columns = ('url', 'visit_time', 'visit_duration', 'browser')
        where = ''

        search = request.args.get('sSearch')
        if search is not None and search != '':
            where = 'WHERE ('
            conds = map(lambda col: ' %s LIKE "%%%s%%" ' % (col, search), columns)
            where += ' OR '.join(conds) + ')'

        limit = 'LIMIT %s, %s' % (request.args.get('iDisplayStart'), 
                                  request.args.get('iDisplayLength'))
        order = 'ORDER BY '

        orders = []
        for i in range(0, int(request.args.get('iSortingCols'))):
            col = int(request.args.get('iSortCol_%s' % i))
            if request.args.get('bSortable_%s' % col) == 'true':
                orders.append('%s %s' % (columns[col], request.args.get('sSortDir_0')))
            
            order += ','.join(orders)
                
        q_str = 'select %s from visits %s %s %s' % (','.join(columns), where, order, limit)
        print 'Query: %s' % q_str
        query = db.execute(q_str)
        output = {'sEcho': int(request.args.get('sEcho')),
                  'aaData': []}
        for row in query:
            output['aaData'].append((row[0],
                                     time.ctime(row[1]),
                                     str(datetime.timedelta(seconds=row[2])) if row[2] else "",
                                     row[3]))

        output['iTotalRecords'] = len(output['aaData'])
        output['iTotalDisplayRecords'] = db.execute('select count(*) from visits').fetchone()[0]

        return json.dumps(output)
        
    
    '''
    query = db.execute("select * from visits")
    output = map(lambda row: [ \
                  row[1], \
                  time.ctime(row[2]), \
                  datetime.timedelta(seconds=row[3]) if row[3] else "", \
                  row[4] \
                 ], query)'''

    return render_template('report.jinja2')
    

if __name__ == '__main__':
    app.run(debug=True)
