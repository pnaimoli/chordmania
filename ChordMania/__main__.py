import argparse
import copy
import itertools
import logging
import random
import music21
from music21.musicxml import m21ToXml
import os

us = music21.environment.UserSettings()
us['musicxmlPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"
us['musescoreDirectPNGPath'] = "~/Applications/MuseScore 3.app/Contents/MacOS/mscore"

ALL_KEY_SIGNATURES = range(-6,7) # Every key (negatives=flats, positives=sharps)

# I'm not interested in performance, I just want to eliminate duplicates
# in one line by using a python set
music21.chord.Chord.__hash__ = lambda self: 0

logger = logging.getLogger("ChordMania")

def has_adjacent_notes_exceeding_max_length(chord, max_length):
    """
    Check if a music21 chord has more than `max_length` adjacent notes.

    Args:
        chord (music21.chord.Chord): A music21 chord to check for adjacent notes.
        max_length (int): The maximum length of adjacent notes allowed.

    Returns:
        bool: True if more than `max_length` adjacent notes are found, False otherwise.
    """
    sorted_notes = sorted(chord.pitches, key=lambda p: p.midi)

    for i in range(1, len(sorted_notes)):
        adjacent_notes_count = 1
        for j in range(i, len(sorted_notes)):
            if sorted_notes[j].midi == sorted_notes[j - 1].midi + 1:
                adjacent_notes_count += 1
                if adjacent_notes_count > max_length:
                    return True
            else:
                break

    return False


class CMFourFiveStreamGenerator(object):
    def __init__(self, num_measures):
        self.score = music21.stream.Score()

        md = music21.metadata.Metadata()
        md.title = "4/5 Stream Practice"
        md.composer = "ChordMania"
        self.score.append(md)

        time_signature = music21.meter.TimeSignature('4/4')

        right_hand = music21.stream.Part()
        right_hand.insert(0, music21.instrument.Piano())
        right_hand.insert(0, music21.clef.TrebleClef())
        right_hand.insert(0, time_signature)

        white_notes = self.get_white_notes_between('C4', 'C6')

        current_root = music21.note.Note('C5')

        for _ in range(num_measures):
            for _ in range(8):
                # Select next root note
                step = random.choice([-2, -1, 0, 1, 2])
                next_index = white_notes.index(current_root) + step
                if 0 <= next_index < len(white_notes) - 5:
                    pass
                else:
                    next_index = int(len(white_notes)/2)
                current_root = white_notes[next_index]

                # Generate random chord
                interval = random.choice([3, 4])
                chord = music21.chord.Chord([current_root, white_notes[next_index+interval]])
                chord.quarterLength = 0.5
                right_hand.append(chord)

        self.score.insert(0, right_hand)

    @staticmethod
    def get_white_notes_between(start, end):
        white_notes = []
        current = music21.note.Note(start)
        while current <= music21.note.Note(end):
            if current.pitch.accidental is None:
                white_notes.append(current)
            current = music21.note.Note(current.pitch).transpose(1)
        return white_notes

    def render(self):
        # Convert the music21 stream to MusicXML format and print to STDOUT
        musicxml_exporter = m21ToXml.GeneralObjectExporter(self.score)
        musicxml_str = musicxml_exporter.parse().decode('utf-8')
        print(musicxml_str)

        # Debug stuff
        logger.debug(self.score._reprText())
        if logger.getEffectiveLevel() <= logging.DEBUG:
            self.score.show(fmt="musicxml.png")

class CMChordGenerator(object):
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

        for measure_number in range(num_chords):
            m = music21.stream.Measure()
            m.number = measure_number + 1

            # Set the first measure's Clef, TimeSignature, and KeySignature
            if measure_number == 0:
                if left_hand == True:
                    m.append(music21.clef.BassClef())
                else:
                    m.append(music21.clef.TrebleClef())
                m.append(music21.meter.TimeSignature('4/4'))

                m.append(key)

            # Generate a random chord and transpose it
            random_chord = self.generate_chord(['4', '5'], key, notes_per_chord)
            if left_hand == True:
                # First move it down a bunch before we move it right back up
                random_chord = random_chord.transpose(-24)

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

    @staticmethod
    def generate_chord(octaves, key, num_notes):
        pitch_classes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        accidentals = ['', '-', '#']
        all_pitches = [f'{pc}{acc}{octave}' for pc in pitch_classes for acc in accidentals for octave in octaves]

        while True:
            chord_pitches = random.sample(all_pitches, num_notes)
            random_chord = music21.chord.Chord(chord_pitches, quarterLength=4).sortChromaticAscending().simplifyEnharmonics(keyContext=key)

            if random_chord.hasAnyRepeatedDiatonicNote():
                continue

            # hasAnyRepeatedDiatonicNote() doesn't actually check to see if there
            # are identical notes.
            if len(set(n.pitch.midi for n in random_chord)) != num_notes:
                print(random_chord)
                continue

            chord_span = random_chord[-1].pitch.midi - random_chord[0].pitch.midi
            if chord_span < 5 or chord_span > 12:
                continue

            # Until Synthesia/MoonPiano/etc... can render better sheet music, disallow
            # too many adjacent notes
            if has_adjacent_notes_exceeding_max_length(random_chord, 2):
                continue

            # We've found a good chord to use!
            break

        return random_chord

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

        # Convert the music21 stream to MusicXML format and print to STDOUT
        musicxml_exporter = m21ToXml.GeneralObjectExporter(self.stream)
        musicxml_str = musicxml_exporter.parse().decode('utf-8')
        print(musicxml_str)

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
    parser.add_argument("-m", "--measures", default=100, type=int, help="Number of measures")
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

#    cg = CMChordGenerator(args.notes, args.measures, key=args.key, both_hands=args.both_hands)
    cg = CMFourFiveStreamGenerator(args.measures)
    cg.render()
