"""
Module for serving XML files from chordmania using Flask.

This module sets up a Flask web server to serve static files and dynamically
generated XML files from chordmania.
"""

import os

from flask import Flask, request, send_from_directory
import music21

import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chordmania

app = Flask(__name__, static_folder='client')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Serve files from the static folder or 'index.html' for the root path.

    If the root path '/' is accessed, 'index.html' is returned. If a specific path is
    requested, the function checks if the file exists in the static folder. If the file
    exists, it is returned; otherwise, a 404 error is raised.

    Args:
    path (str): The requested path.

    Returns:
    Response: A Flask response object to serve the requested file or 'index.html' for the
              root path. Returns a 404 error response if the file does not exist.
    """
    if path == "":
        # Return 'index.html' for the root path
        return send_from_directory(app.static_folder, 'index.html')
    if os.path.exists(os.path.join(app.static_folder, path)):
        # Return the requested file if it exists
        return send_from_directory(app.static_folder, path)
    # Return a 404 error if the file does not exist
    return "Not Found", 404

@app.route('/xmlgen', methods=['GET'])
@app.route('/xmlgen')
def generate_xml():
    """
    Generate an XML file from chordmania.

    This function generates an XML file containing a series of chords based on
    user-provided parameters like notes per chord, number of chords, key signature,
    and whether to use both hands. The generated XML is returned to the user.

    Returns:
    tuple: XML content, HTTP status code, and content type.
    """
    # Default values
    notes_per_chord = 4
    num_chords = 10
    key_signature = 'E'
    both_hands = False

    notes_per_chord = request.args.get('notes', default=notes_per_chord, type=int)
    num_chords = request.args.get('measures', default=num_chords, type=int)
    key_signature = request.args.get('key', default=key_signature, type=str)
    both_hands = request.args.get('both_hands', default=both_hands,
                                  type=lambda x: x.lower() == 'true')

    chord_generator = chordmania.CMChordGenerator(notes_per_chord,
                                                  num_chords,
                                                  music21.key.Key(key_signature),
                                                  both_hands)
    return chord_generator.get_xml(), 200, {'Content-Type': 'application/xml'}

if __name__ == '__main__':
    # Airplay Receiver is using localhost:5000 for whatever reason.
    app.run('localhost', 4999, debug=True)
