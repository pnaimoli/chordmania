import React, { useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, TextField, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastRewindIcon from '@mui/icons-material/FastRewind';

import './App.css';
import {ReactComponent as MetronomeIcon} from './metronome.svg';
import {ReactComponent as CMLogo} from './logo.svg';
import MusicDisplayer from './MusicDisplayer';
import packageInfo from '../package.json';

const lightTheme = createTheme({
  palette: {
    mode: 'light', // Set mode to light
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000', // Dark text for light backgrounds
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd0',
      dark: '#c2185b',
      contrastText: '#000',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#000',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#000',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)', // Black text for light backgrounds
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#42a5f5', // Replace this with your primary.dark color
        },
      },
    },
  },
});

const keySignatures = [
  { value: "A", label: "A" },
  { value: "A-", label: "Ab" },
  { value: "B", label: "B" },
  { value: "B-", label: "Bb" },
  { value: "C", label: "C" },
  { value: "C#", label: "C#" },
  { value: "C-", label: "Cb" },
  { value: "D", label: "D" },
  { value: "D-", label: "Db" },
  { value: "E", label: "E" },
  { value: "E-", label: "Eb" },
  { value: "F", label: "F" },
  { value: "F#", label: "F#" },
  { value: "G", label: "G" },
  { value: "G-", label: "Gb" },
  { value: "a", label: "Am" },
  { value: "a-", label: "Abm" },
  { value: "b", label: "Bm" },
  { value: "b-", label: "Bbm" },
  { value: "c", label: "Cm" },
  { value: "c#", label: "C#m" },
  { value: "c-", label: "Cbm" },
  { value: "d", label: "Dm" },
  { value: "d-", label: "Dbm" },
  { value: "e", label: "Em" },
  { value: "e-", label: "Ebm" },
  { value: "f", label: "Fm" },
  { value: "f#", label: "F#m" },
  { value: "g", label: "Gm" },
  { value: "g-", label: "Gbm" }
];

export default function App() {
  const musicDisplayerRef = useRef(null);
  const [notes, setNotes] = useState(4);
  const [measures, setMeasures] = useState(10);
  const [key, setKey] = useState('E-');
  const [isPlaying, setIsPlaying] = useState(false);
  const [xmlData, setXmlData] = useState('');

  // Initialize state with values from localStorage or default values
  const [bpm, setBpm] = useState(localStorage.getItem('bpm') || 60);
  const [isMetronomeOn, setIsMetronomeOn] = useState(localStorage.getItem('isMetronomeOn') !== null ? localStorage.getItem('isMetronomeOn') === 'true' : true);

  // Use useEffect to save state changes to localStorage
  useEffect(() => {
      localStorage.setItem('bpm', bpm);
  }, [bpm]);
  useEffect(() => {
      localStorage.setItem('isMetronomeOn', isMetronomeOn);
  }, [isMetronomeOn]);

  ////////////////////////////////////////////////////////////////////////////////
  // This is the main function that handles playing the metronome
  // and initiating the animations.
  ////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    // We'd like to just do:
    // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // but we can't since AudioContexts need to be created as a result of a user
    // gesture and this function gets called pretty early on.
    let audioContext;
    let metronomeId;

    if (isPlaying) {
      // Calculate tick duration and metronome logic here
      const tickDuration = (60 / bpm) * 1000; // Duration in milliseconds
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume(); // Safari doesn't play anything without this.

      var beatsCalled = 0;
      metronomeId = setInterval(() => {
        if (isMetronomeOn) {
          // Create a new oscillator for each tick
          const oscillator = audioContext.createOscillator();
          if (beatsCalled === 0) {
            // For the 0th beat, set the higher pitch frequency
            oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          } else {
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          }
            oscillator.type = 'square'; // Adjust as needed
            oscillator.connect(audioContext.destination);
            oscillator.start();

            // Schedule the oscillator to stop after a short duration
            oscillator.stop(audioContext.currentTime + 0.05); // Adjust the duration as needed
          }

          if (beatsCalled === 3) {
            // If this is the last beat, go back to 0 and advance the cursor
            beatsCalled = 0;
            if (!musicDisplayerRef.current.advanceCursor()) {
              // If we've reached the end of the music, stop playing
              setIsPlaying(false);
              musicDisplayerRef.current.rewind();
            }
          } else {
            beatsCalled++;
          }
      }, tickDuration);
    }

    // Cleanup
    return () => {
      clearInterval(metronomeId);

      // Close the AudioContext when cleaning up
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isPlaying, isMetronomeOn, bpm]);

  const handleNotesChange = (e) => {
    const value = Math.max(1, Math.min(5, Number(e.target.value)));
    setNotes(value);
  };

  const handleMeasuresChange = (e) => {
    const value = Math.max(1, Math.min(999, Number(e.target.value)));
    setMeasures(value);
  };

  const handleSubmit = async () => {
    try {
      // Construct the URL with query parameters
      const url = new URL('./test_cm.xml', window.location.href);
      url.searchParams.append('notes', notes);
      url.searchParams.append('measures', measures);
      url.searchParams.append('key', key);

      // Perform the fetch request
      const response = await fetch(url);

      // Check if the response is ok (status code in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response body (assuming it's in text format)
      const data = await response.text();

      // Update the state with the fetched data
      setXmlData(data);
    } catch (error) {
      // Handle any errors
      console.error('Fetch error:', error);
    }
  };

  const renderAppBar = () => {
    return (
    <AppBar>
      <Toolbar>
        {/* Version Display */}
        <div className="version-display">
          ChordMania {packageInfo.version}
        </div>
        <CMLogo
           height='100%'
           width='50px'
           style={{ minWidth: '50px', mr: 2, ml: 2}}
        />
        <TextField
          label="Notes"
          type="number"
          value={notes}
          onChange={handleNotesChange}
          sx={{ mx: 2, my: 1, width: 60 }}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 5 }}
          size="small"
        />
        <TextField
          label="Measures"
          type="number"
          sx={{ mx: 2, my: 1, width: 80 }}
          inputProps={{ min: 1, max: 999 }}
          size="small"
          value={measures}
          onChange={handleMeasuresChange}
          InputLabelProps={{ shrink: true, }}
        />
        <TextField
          select
          label="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          sx={{ mx: 2, my: 1, width: 80 }}
          size="small"
          SelectProps={{ native: true }}
        >
          {keySignatures.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
        <div className="MetronomeSettings">
          <label>
            <MetronomeIcon />:
            <input type="checkbox" checked={isMetronomeOn} onChange={() => setIsMetronomeOn(!isMetronomeOn)}/>
            <span className="MetronomeToggleText">
              {isMetronomeOn ? 'ON' : 'OFF'}
            </span>
          </label>
          <label>
            <input type="range" min="40" max="240" value={bpm} onChange={(e) => (setBpm(e.target.value))} />
            <span className="BPMText">
              {bpm}
            </span>
            BPM
          </label>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mx: 2, my: 1, width: 120, height: 48 }}
        >
          Generate XML
        </Button>
      </Toolbar>
    </AppBar>);
  };

  const renderBody = () => {
    if (xmlData) {
      return (
        <div>
          <div className="sheetMusicContainer" style={{ position: 'relative' }}>
            <IconButton
              onClick={() => musicDisplayerRef.current.rewind()}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 10, // Ensure it's above other elements
                color: 'primary' // Adjust color as needed
              }}
            >
              <FastRewindIcon />
            </IconButton>
            <IconButton
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                position: 'absolute',
                top: 10,
                left: 60,
                zIndex: 10, // Ensure it's above other elements
                color: 'primary' // Adjust color as needed
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </div>
          <MusicDisplayer
                    key={xmlData}
                    file={xmlData}
                    ref={musicDisplayerRef}
                  />
        </div>
        );
    } else {
      // Case 2: 'xmlData' is not specified
      return (
        <div className="InstructionalContent">
          <h2>Welcome to ChordMania</h2>
            <div className="Instructions">
              <div className="InstructionStep">
                <span className="Icon">🎵</span>
                <p>Start by setting your desired number of notes and measures using the input fields above.</p>
              </div>
              <div className="InstructionStep">
                <span className="Icon">🗝️</span>
                <p>Select the key for your composition from the 'Key' dropdown menu.</p>
              </div>
              <div className="InstructionStep">
                <span className="Icon">⏱️</span>
                <p>Adjust the metronome settings. Toggle the metronome ON or OFF and set the BPM (Beats Per Minute) as needed.</p>
              </div>
              <div className="InstructionStep">
                <span className="Icon">📜</span>
                <p>Click 'Generate XML' to create your custom MusicXML based on the specified notes, measures, and key.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box>
        {renderAppBar()}
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Toolbar />
          {renderBody()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
