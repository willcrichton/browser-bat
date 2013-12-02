from flask    import *
from urlparse import urlparse
from scrape   import *
import json
import os
import sqlite3
import operator
import platform

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

    downloads = []
    for (path,) in db.execute('SELECT path FROM downloads'):
        downloads.append({'path': path, 'name': os.path.basename(path)})
    
    browser_data['downloads'] = downloads

    # load analysis here
    return render_template('index.jinja2', data=json.dumps(browser_data),
                           config={'cache': 'lol', 'history': config_path(platform.system(), platform.release(), 'chrome')[1]})

@app.route('/analyze')
def analyze():
    cPathOut = config_path(platform.system(), platform.release(), 'chrome')
    if not cPathOut[0]:
        raise Exception(cPathOut[1])
    else:
        port_visits_db(cPathOut[1])

    return redirect(url_for('index'))

@app.route('/query')
def query():
    db = sqlite3.connect(DB_DIR + '/' + DB_NAME).cursor()
    query = db.execute(request.args['q'])
    output = [row for row in query]
    return json.dumps(output, indent=4, separators=(',', ': '))
    

if __name__ == '__main__':
    app.run(debug=True)
