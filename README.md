# ChordMania

ChordMania is an interactive web application designed for musicians to practice and enhance their sight-reading skills with a focus on jazz and complex chords. It generates worksheets of random complicated chords and allows for dynamic web-based interaction.

![sample worksheet](sample.png)

## About

ChordMania originally started as a simple tool for generating chord worksheets to aid in sight-reading practice. It has now evolved into a full-fledged web application, providing an interactive platform for musicians to practice and improve their skills in reading and playing complex chords.

**Key Features:**

- **Worksheet Generation:** ChordMania generates worksheets of random complicated chords, allowing musicians to practice sight-reading in a targeted and effective manner.
- **Interactive Web Application:** The web interface provides a user-friendly and dynamic way to interact with the chord worksheets.
- **Customizable Practice Sessions:** Users can customize various parameters like the number of chords, key signatures, and more, to tailor their practice sessions.
- **Support for Various Devices:** The application is accessible on different devices, offering flexibility and convenience in practice.

## Development Information

### Requirements

- [python3](https://www.python.org/downloads/)
- [music21](http://web.mit.edu/music21/)
- Additional requirements may be found in the `server/requirements.txt`.

### Project Organization

The project is organized into several key directories:

- **client/**: Contains the React code for the web application's frontend.
- **server/**: 
  - **chordmania/**: The original ChordMania library for generating chord worksheets.
  - **xmlserver.py**: A Flask server for serving the web application and handling backend logic.
- **build/** - The production directory. It contains the build the final build.

### Installation

The installation and running of the project are currently handled through an ad-hoc series of steps. Follow these instructions to set up and run a test server on your machine:

1. **Prepare the Server Directory:**
   - Run `./build.sh`.

5. **Run the Test Server:**
   - You can now run a test server on your machine. In the `build` directory, use the command `python measure_hider_modeler.py` to start the server.

These steps will set up both the client and server sides of the application, allowing you to run a test server locally for development and testing purposes.

### Generating Worksheets Directly

You can also use ChordMania to generate worksheets directly from the command line:

   ```bash
   python -m server.chordmania --help
   ```

Once you've got an .xml file as output, you could also run it through tools like [Synthesia](https://synthesiagame.com/) or [MoonPiano](https://mp-app.praisethemoon.org/).
