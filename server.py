from flask import *
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.jinja2')

@app.route('/analyze')
def analyze():
    return json.dumps({'foo': 'bar'})

if __name__ == '__main__':
    app.run(debug=True)
