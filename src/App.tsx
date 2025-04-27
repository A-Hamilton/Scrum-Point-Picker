// src/App.tsx
import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { SocketProvider } from './context/SocketContext';       // ← new
import { SessionProvider } from './context/SessionContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import SessionPage from './pages/SessionPage';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
  }), []);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SocketProvider>              {/* Socket.IO connected */}
          <SessionProvider>           {/* Real-time session context */}
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateSessionPage />} />
                <Route path="/join" element={<JoinSessionPage />} />
                <Route path="/session/:id" element={<SessionPage />} />
              </Routes>
            </Router>
          </SessionProvider>
        </SocketProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
