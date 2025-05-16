// src/index.tsx
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Box,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const Root: React.FC = () => {
  // 1️⃣ Theme state
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        components: {
          // 2️⃣ Minor UI tweak: a bit more rounding everywhere
          MuiPaper: { defaultProps: { elevation: 4 }, styleOverrides: { root: { borderRadius: 12 } } },
          MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
        },
      }),
    [mode]
  );

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* 3️⃣ Light/dark toggle at top-right */}
      <Box
        position="fixed"
        top={16}
        right={16}
        zIndex="tooltip"
      >
        <IconButton onClick={toggleMode} color="inherit">
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

const container = document.getElementById('root')!;
createRoot(container).render(<Root />);
