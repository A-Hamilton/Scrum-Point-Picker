import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import createUser from './utils/createUser';
import HomePage from './pages/HomePage';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import SessionPage from './pages/SessionPage';
import Navbar from './components/Navbar';
import { socket } from './socket';

const App: React.FC = () => {
  useEffect(() => {
    createUser();
    socket.connect();
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateSessionPage />} />
        <Route path="/join" element={<JoinSessionPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </>
  );
};

export default App;
