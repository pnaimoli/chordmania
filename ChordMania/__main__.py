# FileName PyQt5MenuProblem.py
import argparse
import copy
import random
import music21
import numpy as np

us = music21.environment.UserSettings()
us['musicxmlPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"
us['musescoreDirectPNGPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"

ALL_KEY_SIGNATURES = range(-6,7) # Every key (negatives=flats, positives=sharps)

class CMChordGenerator(object):
    def __init__(self, notes_per_chord, num_chords, key=None):
        self.notes_per_chord = notes_per_chord

        # Create our stream!
        self.stream = music21.stream.Stream()
        md = music21.metadata.Metadata()
        md.title = "ChordMania Practice"
        md.composer = "ChordMania"
        md.movementName = "{} Chords".format(num_chords)
        self.stream.append(md)
        part = music21.instrument.Piano()
        part.partName = "Piano"
        self.stream.append(part)
        self.stream.append(music21.meter.TimeSignature('4/4'))

        while True:
            m = music21.stream.Measure()
            num_measures = len(self.stream.getElementsByClass(music21.stream.Measure))
            m.number = num_measures + 1

            # Keep adding measures until we have 100 of them
            if num_measures >= num_chords:
                break

            # Set the first measure's KeySignature
            if num_measures == 0:
                if key:
                    m.append(music21.key.Key(key))
                else:
                    m.append(music21.key.KeySignature(random.choice(ALL_KEY_SIGNATURES)))

            # Generate a random chord and transpose it
            random_chord = self.generate_chord()
            random_chord = random_chord.transpose(random.choice(range(0,12))).simplifyEnharmonics()

            # Don't include it for now if two adjacent notes would take up the same space
            if random_chord.hasAnyRepeatedDiatonicNote():
                continue

            # Update the measure and add it to our stream
            m.append(random_chord)
            self.stream.append(m)

        # Debug: print out a text version of the whole stream
        print(self.stream.show('text'))
#        print(list(self.stream.getElementsByClass(music21.key.KeySignature)))


#        test_pitches = (music21.pitch.Pitch("C#4"), music21.pitch.Pitch("D#4"), music21.pitch.Pitch("A#4"), music21.pitch.Pitch("B4"))
#        test_chord = music21.chord.Chord(test_pitches, type="whole")
#        self.stream.append(test_chord)

    def generate_chord(self):
        # Start off with an octave full of notes.  60 is MIDI for
        # middle C, and 72 (not included here) is exactly one octave above
        possible_notes = list(range(60,72))

        # Create a whole-note chord out of notes_per_chord notes from this range.
        # We need to do it this way because there are a few restrictions:
        # 1) Can't have more than 2 consecutive semi-tones
        # 2) ?
        def longest_cluster(notes):
            a = np.split(notes, np.where(np.diff(notes) != 1)[0] + 1) 
            return len(max(a, key=len).tolist())
            
        random_chord = music21.chord.Chord(type="whole")
        while len(random_chord) < self.notes_per_chord:
            # Pick another note to add
            note_to_add = music21.note.Note(random.choice(possible_notes))
            # (But skip if we already added this note)
            if note_to_add in random_chord:
                continue

            # Add and re-sort
            random_chord.add(note_to_add)
            random_chord.sortChromaticAscending()

            # Until Synthesia can render better sheet music, disallow
            # any adjacent notes
            if longest_cluster([p.midi for p in random_chord.pitches]) > 1:
                random_chord.remove(note_to_add)
                continue

        return random_chord.simplifyEnharmonics()

    @staticmethod
    def invert(chord):
        # Randomly invert.  Is there a cleaner way to do this with
        # the music21 API?  chord inversion doesn't always work...
        chord = copy.deepcopy(chord)
        print(chord.pitches)
        pitches = [None]*len(chord)
        inversion = random.choice(range(len(chord)))
        print(inversion)
        for i in range(len(chord)):
            pitches[i-inversion] = chord.pitches[i]
            if i < inversion:
                pitches[i-inversion].transpose(music21.interval.GenericInterval(8), inPlace=True)
        print(pitches)
        return music21.chord.Chord(pitches, type="whole").simplifyEnharmonics


    def render(self, out="score.png"):
#        self.stream.write(fmt="musicxml.png", fp="score.png")
        self.stream.write(fmt="midi", fp="ChordMania.midi")
        self.stream.write(fmt="musicxml", fp="ChordMania.xml")
        self.stream.show(fmt="musicxml.png")

if __name__== "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-k", "--key", help="Key Signature")
    parser.add_argument("-c", "--chords", default=100, help="Number of chords")
    parser.add_argument("-n", "--notes", default=4, help="Number of notes per chords")
    args = parser.parse_args()

    cg = CMChordGenerator(args.notes, args.chords, key=args.key)
    cg.render()
