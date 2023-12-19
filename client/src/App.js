import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, Typography, TextField, Button } from '@mui/material';

import {ReactComponent as CMLogo} from './logo.svg';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#ff5252',
    },
    background: {
      default: '#fff',
    },
  },
  components: {
    // Override styles for the Outlined Input
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Style overrides here
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000', // Your desired color for the border
          },
        },
      },
    },
    // Override styles for the Input Label
    MuiInputLabel: {
      styleOverrides: {
        root: {
          // Style overrides here
          '&.Mui-focused': {
            color: '#000',
          },
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
  const [notes, setNotes] = useState(4);
  const [measures, setMeasures] = useState(10);
  const [key, setKey] = useState('E');
  const [xmlData, setXmlData] = useState('');

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
      const url = new URL('./xmlgen', window.location.href);
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

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <CssBaseline />
        <AppBar>
          <Toolbar>
            <CMLogo
               height='auto'
               width='50'
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
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Toolbar />
          <Typography paragraph>{xmlData}</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
