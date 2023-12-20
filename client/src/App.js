import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, Typography, TextField, Button } from '@mui/material';

import {ReactComponent as CMLogo} from './logo.svg';
import MusicDisplayer from './MusicDisplayer';

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
});


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#a6d4fa',
      dark: '#648dae',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f6a5c0',
      dark: '#aa647b',
      contrastText: '#fff',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff',
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
      contrastText: '#fff',
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
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
  const [notes, setNotes] = useState(4);
  const [measures, setMeasures] = useState(10);
  const [key, setKey] = useState('E-');
  const [xmlData, setXmlData] = useState('');
  const [file, setFile] = useState('MuzioClementi_SonatinaOpus36No1_Part2.xml');

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
        <CMLogo
           height='100%'
           width='50px'
           style={{ minWidth: '50px', mr: 2, ml: 2}}
        />
        <Typography
          variant="h6"
          noWrap
          sx={{
            mr: 2,
            ml: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          ChordMania
        </Typography>
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
          sx={{ mx: 2, my: 1, width: 100 }}
          size="small"
          SelectProps={{ native: true }}
        >
          {keySignatures.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
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
    let content;

    if (xmlData) {
      // Case 1: 'xmlData' is specified
      content = <MusicDisplayer key={xmlData} file={xmlData} />;
    } else if (file) {
      // Case 2: 'file' is specified and 'xmlData' is not specified or empty
      content = <MusicDisplayer key={file} file={file} />;
    } else {
      // Case 3: Neither 'file' nor 'xmlData' is specified, or both are empty
      content = <div>Instruction page content goes here</div>;
    }

    return (
        content
    );
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box>
        {renderAppBar()}
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Toolbar />
          <select onChange={(e) => setFile(e.target.value)}>
            <option value="MuzioClementi_SonatinaOpus36No1_Part2.xml">Muzio Clementi: Sonatina Opus 36 No1 Part2</option>
            <option value="Beethoven_AnDieFerneGeliebte.xml">Beethoven: An Die FerneGeliebte</option>
          </select>
          {renderBody()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
