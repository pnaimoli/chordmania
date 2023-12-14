from . import (CMChordGenerator, )

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
    all_keys = range(-6, 7)  # Every key (negatives=flats, positives=sharps)
    if not args.key:
        args.key = music21.key.KeySignature(random.choice(all_keys)).asKey()

    cg = CMChordGenerator(args.notes, args.measures, key=args.key, both_hands=args.both_hands)
#    cg = CMFourFiveStreamGenerator(args.measures)
#    cg = CMStreamGenerator(args.measures)
    cg.output_score()
