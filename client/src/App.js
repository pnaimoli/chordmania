import React, { useState } from 'react';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Toolbar, Typography, IconButton, List, ListItem, Divider, TextField, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;

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

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const [open, setOpen] = useState(true);
  const [notes, setNotes] = useState(4);
  const [measures, setMeasures] = useState(10);
  const [key, setKey] = useState('E');
  const [xmlData, setXmlData] = useState('');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Mini Variant Drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem sx={{ justifyContent: open ? 'initial' : 'center', py: 0, minHeight: 48 }}>
              <TextField
                label="Notes"
                type="number"
                value={notes}
                onChange={handleNotesChange}
                sx={{ mx: open ? 2 : 'auto', my: 1, width: 60 }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 5 }}
                size="small"
                hiddenLabel={!open}
              />
            </ListItem>
            <ListItem sx={{ justifyContent: open ? 'initial' : 'center', py: 0, minHeight: 48 }}>
              <TextField
                label="Measures"
                type="number"
                fullWidth
                hiddenLabel={!open}
                size="small"
                value={measures}
                onChange={handleMeasuresChange}
                sx={{ mx: open ? 2 : 'auto', my: 1, width: 80 }}
                inputProps={{ min: 1, max: 999 }}
              />
            </ListItem>
            <ListItem sx={{ justifyContent: open ? 'initial' : 'center', py: 0, minHeight: 48 }}>
              <TextField
                select
                label="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                sx={{ mx: open ? 2 : 'auto', my: 1, width: open ? 'auto' : 48 }}
                size="small"
                SelectProps={{
                  native: false,
                }}
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
            </ListItem>
            <ListItem sx={{ justifyContent: open ? 'initial' : 'center', py: 0, minHeight: 48 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mx: open ? 2 : 'auto', my: 1, width: open ? 'auto' : 48, height: 48 }}
              >
                {open ? "Generate XML" : "🎶"}
              </Button>
            </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Typography paragraph>{xmlData}</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
