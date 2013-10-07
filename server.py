from flask import *
import json

app = Flask(__name__)

@app.route('/')
def index():
    # load analysis here
    data = {'foo': 'bar'}
    return render_template('index.jinja2', data=json.dumps(data))

@app.route('/analyze')
def analyze():
    # do analysis here
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
