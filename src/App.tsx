import React, { useEffect, createContext, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import createUser from './utils/createUser';
import { socket } from './socket';
import SessionPage from './pages/SessionPage';

// Theme toggle context
export interface ColorModeContextType {
  toggleColorMode: () => void;
}
export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {}
});

function App(): JSX.Element {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const colorMode = useMemo<ColorModeContextType>(
    () => ({
      toggleColorMode: () =>
        setMode(prev => (prev === 'light' ? 'dark' : 'light'))
    }),
    []
  );

  useEffect(() => {
    createUser();
    socket.connect();
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SessionPage />} />
        </Routes>
      </BrowserRouter>
    </ColorModeContext.Provider>
  );
}

export default App;
