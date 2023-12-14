from flask import Flask, request, jsonify, send_from_directory
import os

import music21
import chordmania

app = Flask(__name__, static_folder='client')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>ChordMania</title>
    </head>
    <body>
        <h1>Welcome to ChordMania</h1>
        <p>This page is under construction.
        Check out <a href="./xmlgen">XMLGen</a>.</p>
    </body>
    </html>
    '''
#    if path != "" and os.path.exists(app.static_folder + '/' + path):
#        return send_from_directory(app.static_folder, path)
#    else:
#        return send_from_directory(app.static_folder, 'index.html')

@app.route('/xmlgen', methods=['POST'])
@app.route('/xmlgen')
def process_image():
#    image_data_url = request.json.get('imageData')
#    header, encoded = image_data_url.split(",", 1)
    cg = chordmania.CMChordGenerator(4, 10, music21.key.Key('E'), both_hands=False)
    return jsonify(cg.get_xml())

if __name__ == '__main__':
    app.run('localhost',4999,debug=True)
