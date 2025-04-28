import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeContextProvider from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import SessionPage from './pages/SessionPage';
import createUser from './utils/createUser';
import { socket } from './socket';

const App: React.FC = () => {
  useEffect(() => {
    createUser();
    socket.connect();
  }, []);

  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateSessionPage />} />
          <Route path="/join" element={<JoinSessionPage />} />
          <Route path="/session/:id" element={<SessionPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
};

export default App;
