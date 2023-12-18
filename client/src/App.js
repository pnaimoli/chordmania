import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, Typography, IconButton, List, ListItem, Divider, TextField, MenuItem, Button } from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
});

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
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
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
            />
            <TextField
              select
              label="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              sx={{ mx: 2, my: 1, width: 100 }}
              size="small"
              SelectProps={{ native: false }}
            >
              {/* Common musical key signatures */}
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="A-">Ab</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="B-">Bb</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="C#">C#</MenuItem>
              <MenuItem value="C-">Cb</MenuItem>
              <MenuItem value="D">D</MenuItem>
              <MenuItem value="D-">Db</MenuItem>
              <MenuItem value="E">E</MenuItem>
              <MenuItem value="E-">Eb</MenuItem>
              <MenuItem value="F">F</MenuItem>
              <MenuItem value="F#">F#</MenuItem>
              <MenuItem value="G">G</MenuItem>
              <MenuItem value="G-">Gb</MenuItem>
              <MenuItem value="a">Am</MenuItem>
              <MenuItem value="a-">Abm</MenuItem>
              <MenuItem value="b">Bm</MenuItem>
              <MenuItem value="b-">Bbm</MenuItem>
              <MenuItem value="c">Cm</MenuItem>
              <MenuItem value="c#">C#m</MenuItem>
              <MenuItem value="c-">Cbm</MenuItem>
              <MenuItem value="d">Dm</MenuItem>
              <MenuItem value="d-">Dbm</MenuItem>
              <MenuItem value="e">Em</MenuItem>
              <MenuItem value="e-">Ebm</MenuItem>
              <MenuItem value="f">Fm</MenuItem>
              <MenuItem value="f#">F#m</MenuItem>
              <MenuItem value="g">Gm</MenuItem>
              <MenuItem value="g-">Gbm</MenuItem>
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
