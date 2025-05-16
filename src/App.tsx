import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import SessionPage from './pages/SessionPage';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/create" element={<CreateSession />} />
    <Route path="/join" element={<JoinSession />} />
    <Route path="/:sessionID" element={<SessionPage />} />
  </Routes>
);

export default App;