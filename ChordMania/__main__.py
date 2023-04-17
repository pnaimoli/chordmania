import argparse
import copy
import itertools
import logging
import random
import music21
import os
import tempfile

us = music21.environment.UserSettings()
us['musicxmlPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"
us['musescoreDirectPNGPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"

ALL_KEY_SIGNATURES = range(-6,7) # Every key (negatives=flats, positives=sharps)

# I'm not interested in performance, I just want to eliminate duplicates
# in one line by using a python set
music21.chord.Chord.__hash__ = lambda self: 0

logger = logging.getLogger("ChordMania")

class CMRandomChordGenerator(object):
    def __init__(self, notes_per_chord, num_chords, key, both_hands):
        self.notes_per_chord = notes_per_chord

        # Create our stream!
        self.stream = music21.stream.Stream()
        md = music21.metadata.Metadata()
        md.title = "Random {} Practice".format(key.name.replace("-", "b"))
        md.composer = "ChordMania"
        md.movementName = "{} Chords".format(num_chords)
        self.stream.append(md)

        parts = [self._generate_part(notes_per_chord, num_chords, key, False)]
        if both_hands:
            parts.append(self._generate_part(notes_per_chord, num_chords, key, True))
            staffGroup = music21.layout.StaffGroup(parts, name='Piano', abbreviation='Pno.', symbol='brace')
            staffGroup.barTogether = 'Mensurstrich'
            self.stream.append(staffGroup)

        self.stream.append(parts)

    def _generate_part(self, notes_per_chord, num_chords, key, left_hand):
        part = music21.stream.PartStaff()
        instrument = music21.instrument.Piano()
        instrument.partName = "Piano"
        part.append(instrument)

        while True:
            m = music21.stream.Measure()
            num_measures = len(self._get_all_chords(part))
            m.number = num_measures + 1

            # Keep adding measures until we have 100 of them
            if num_measures >= num_chords:
                break

            # Set the first measure's Clef, TimeSignature, and KeySignature
            if num_measures == 0:
                if left_hand == True:
                    m.append(music21.clef.BassClef())
                else:
                    m.append(music21.clef.TrebleClef())
                m.append(music21.meter.TimeSignature('4/4'))

                m.append(key)

            # Generate a random chord and transpose it
            random_chord = self.generate_chord()
            if left_hand == True:
                # First move it down a bunch before we move it right back up
                random_chord = random_chord.transpose(-24)
            random_chord = random_chord.transpose(random.choice(range(0,12))).simplifyEnharmonics(keyContext=key)

            # Don't include it for now if two adjacent notes would take up the same space
            if random_chord.hasAnyRepeatedDiatonicNote():
                continue

            # Update the measure with a ChordSymbol if possible.
            # Only include ChordSymbols for the right hand at the moment.
            if left_hand == False:
                cs_string = music21.harmony.chordSymbolFigureFromChord(random_chord)
                if cs_string != 'Chord Symbol Cannot Be Identified':
                    try:
                        # Sometimes you get a weird exception like:
                        # "-poweradda is not a supported accidental type" or
                        # "#m/aadde- is not a supported accidental type"
                        # I don't know exactly what the problem is, but let's just
                        # not annotate those chords
                        m.append(music21.harmony.ChordSymbol(cs_string))
                    except music21.pitch.AccidentalException as e:
                        pass

            # Finally add the chord to the measure, and the measure to the stream
            m.append(random_chord)
            part.append(m)

        return part

    def generate_chord(self):
        # Start off with an octave full of notes.  60 is MIDI for
        # middle C, and 72 (not included here) is exactly one octave above
        possible_notes = list(range(60,72))

        # Create a whole-note chord out of notes_per_chord notes from this range.
        # We need to do it this way because there are a few restrictions:
        # 1) Can't have more than 2 consecutive semi-tones
        # 2) ?
        def longest_cluster(notes):
            if not notes:
                return 0

            next_to_previous_note = [abs(b - a) <= 1 for (a, b) in zip(notes[:-1], notes[1:])]

            if True not in next_to_previous_note:
                return 1

            return max(len(list(y)) for (c,y) in itertools.groupby(next_to_previous_note) if c==True) + 1
            
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

            # Until Synthesia/MoonPiano/etc... can render better sheet music, disallow
            # too many adjacent notes
            if longest_cluster([p.midi for p in random_chord.pitches]) > 3:
                random_chord.remove(note_to_add)
                continue

        return random_chord.simplifyEnharmonics()

    @staticmethod
    def invert(chord):
        # Randomly invert.  Is there a cleaner way to do this with
        # the music21 API?  chord inversion doesn't always work...
        chord = copy.deepcopy(chord)
        pitches = [None]*len(chord)
        inversion = random.choice(range(len(chord)))
        for i in range(len(chord)):
            pitches[i-inversion] = chord.pitches[i]
            if i < inversion:
                pitches[i-inversion].transpose(music21.interval.GenericInterval(8), inPlace=True)
        return music21.chord.Chord(pitches, type="whole").simplifyEnharmonics

    def _get_all_chords(self, parent):
        # ChordSymbol derives from Chord, so we need to filter out only
        # the Chords since getElementsByClass will return both.
        return [e for e in parent.recurse().getElementsByClass(music21.chord.Chord)
                if e.__class__ is music21.chord.Chord]

    def _get_unique_chords(self, parent):
        return set(self._get_all_chords(parent))

    def render(self):
        # Finalize some metadata
        md = self.stream.getElementsByClass(music21.metadata.Metadata).stream().next()
        md["description"] = "{}/{} chords are unique.".format(len(self._get_unique_chords(self.stream)), len(self._get_all_chords(self.stream)))
        with tempfile.TemporaryDirectory() as tmp:
            temp_filename = os.path.join(tmp, next(tempfile._get_candidate_names()) + ".musicxml")
            self.stream.write(fmt="musicxml", fp=temp_filename)
            with open(temp_filename, 'r') as fin:
                print(fin.read())

        # Debug stuff
        logger.debug(self.stream._reprText())
        if logger.getEffectiveLevel() <= logging.DEBUG:
            self.stream.show(fmt="musicxml.png")

if __name__== "__main__":
    parser = argparse.ArgumentParser(
            prog='ChordMania',
            formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-k", "--key", type=music21.key.Key,
                        help="Key Signature.  Use '-' for flats and lowercase letters for minor.")
    parser.add_argument("-c", "--chords", default=100, type=int, help="Number of chords")
    parser.add_argument("-n", "--notes", default=4, type=int, help="Number of notes per chords")
    parser.add_argument("-b", "--both_hands", action='store_true', help="Include both hands")
    parser.add_argument("-d", "--debug", help="Debug mode",
                        action="store_const", dest="loglevel", const=logging.DEBUG,
                        default=logging.WARNING)
    args = parser.parse_args()

    logging.basicConfig()
    logger.setLevel(level=args.loglevel)

    # Just pick a random Key if nothing is provided on the command line
    if not args.key:
        args.key = music21.key.KeySignature(random.choice(ALL_KEY_SIGNATURES)).asKey()

    cg = CMRandomChordGenerator(args.notes, args.chords, key=args.key, both_hands=args.both_hands)
    cg.render()
