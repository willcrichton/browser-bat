from flask    import *
from urlparse import urlparse
import json
import os
import sqlite3
import operator

app = Flask(__name__)

browser_data = {}

CACHE = '/Users/will/Library/Caches/Google/Chrome/Default/Cache'
HISTORY = '/Users/will/Library/Application Support/Google/Chrome/Default/History'

@app.route('/')
def index():
    # load analysis here
    return render_template('index.jinja2', data=json.dumps(browser_data))

# Chrome cache: ~/Library/Caches/Google/Chrome/Default/Cache
# Firefox cache: ~/Library/Caches/Firefox/Profiles/<profile name>/<weird directories>
# Chrome history: ~/Library/Application Support/Google/Chrome/Default/History
# Firefox history; ~/Library/Application Support/Firefox/Profiles/<profile name>/places.sqlite

@app.route('/analyze')
def analyze():
    global browser_data

    chrome_cache = os.listdir(CACHE)
    chrome_history = sqlite3.connect(HISTORY)
    c = chrome_history.cursor()
    
    # find most visited sites
    urls = {}
    for row in c.execute('SELECT url, visit_count FROM urls'):
        url = urlparse(row[0])
        if not url.netloc in urls:
            urls[url.netloc] = 0
        urls[url.netloc] += int(row[1])

    browser_data['sites'] = sorted(urls.iteritems(), key=operator.itemgetter(1), reverse=True)

    downloads = []
    for row in c.execute('SELECT current_path, referrer FROM downloads'):
        downloads.append({'path': row[0], 'url': row[1]})
    
    browser_data['downloads'] = downloads

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
