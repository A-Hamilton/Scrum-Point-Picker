// src/pages/CreateSession.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { v4 as uuidv4 } from 'uuid';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const CreateSession: React.FC = () => {
  const [name, setName]       = useState('');
  const [sessionId, setId]    = useState('');
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const generate = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError('Enter your name');
    try {
      const userID = uuidv4();
      const res = await api.post<{ id: string }>('/sessions', {
        user: { userID, userName: trimmed }
      });
      setId(res.data.id);
    } catch {
      setError('Failed to create session');
    }
  };

  const enter = () => {
    if (!sessionId) return setError('Generate a session first');
    navigate(`/${sessionId}`, {
      state: { userID: uuidv4(), userName: name.trim() }
    });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Create a New Session
      </Typography>
      <TextField
        label="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button fullWidth variant="contained" onClick={generate}>
        Generate Session ID
      </Button>
      <TextField
        label="Session ID"
        value={sessionId}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />
      {error && (
        <Box sx={{ mt: 1 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Button fullWidth variant="outlined" onClick={enter}>
          Enter Session
        </Button>
      </Box>
    </Container>
  );
};

export default CreateSession;