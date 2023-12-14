from flask import Flask, request, send_from_directory
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
        Check out <a href="./xmlgen?notes=4&measures=3">XMLGen</a>.</p>
    </body>
    </html>
    '''
#    if path != "" and os.path.exists(app.static_folder + '/' + path):
#        return send_from_directory(app.static_folder, path)
#    else:
#        return send_from_directory(app.static_folder, 'index.html')

@app.route('/xmlgen', methods=['GET'])
@app.route('/xmlgen')
def generate_xml():
    # Default values
    notes_per_chord = 4
    num_chords = 10
    key_signature = 'E'
    both_hands = False

    notes_per_chord = request.args.get('notes', default=notes_per_chord, type=int)
    num_chords = request.args.get('measures', default=num_chords, type=int)
    key_signature = request.args.get('key', default=key_signature, type=str)
    both_hands = request.args.get('both_hands', default=both_hands, type=lambda x: x.lower() == 'true')

    cg = chordmania.CMChordGenerator(notes_per_chord, num_chords, music21.key.Key(key_signature), both_hands)
    return cg.get_xml(), 200, {'Content-Type': 'application/xml'}

if __name__ == '__main__':
    app.run('localhost', 4999, debug=True)
