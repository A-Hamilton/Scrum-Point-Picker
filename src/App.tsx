// src/App.tsx
import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import CreateSessionPage from './pages/CreateSessionPage';
import SessionPage from './pages/SessionPage';

const App: React.FC = () => {
  // Start in system preference (or light fallback):
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');

  // Rebuild theme only when mode changes:
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
          background: {
            default: mode === 'dark' ? '#121212' : '#fafafa',
            paper: mode === 'dark' ? '#1d1d1d' : '#fff',
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline gives you the correct background+text colors */}
      <CssBaseline />

      {/* Toggle button in the top-right */}
      <Box
        position="fixed"
        top={8}
        right={8}
        zIndex={1300}         // above everything
      >
        <IconButton
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          color="inherit"
        >
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Box>

      {/* Your routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route path="/create" element={<CreateSessionPage />} />
        <Route path="/session/:sessionID" element={<SessionPage />} />
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
