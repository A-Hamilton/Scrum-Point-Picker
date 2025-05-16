// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionPage from './pages/SessionPage';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/create" replace />} />
    <Route path="/create" element={<CreateSessionPage />} />
    <Route path="/session/:sessionID" element={<SessionPage />} />
    <Route path="*" element={<Navigate to="/create" replace />} />
  </Routes>
);

export default App;
