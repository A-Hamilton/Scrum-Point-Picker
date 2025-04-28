// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import createUser from './utils/createUser';
import { socket } from './socket';
import HomePage from './pages/HomePage';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import SessionPage from './pages/SessionPage';

const App: React.FC = () => {
  useEffect(() => {
    createUser();      // prompt for your username once
    socket.connect();  // then connect your socket
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateSessionPage />} />
        <Route path="/join" element={<JoinSessionPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
