// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionPage from './pages/SessionPage';
import { Box } from '@mui/material';

const App: React.FC = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Routes>
      <Route path="/" element={<Navigate to="/create" replace />} />
      <Route path="/create" element={<CreateSessionPage />} />
      <Route path="/session/:sessionID" element={<SessionPage />} />
      <Route path="*" element={<Navigate to="/create" replace />} />
    </Routes>
  </Box>
);

export default App;
