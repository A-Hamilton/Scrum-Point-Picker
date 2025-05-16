// src/pages/CreateSessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';
import { socket } from '../socket';

const MAX_NAME_LENGTH = 20;

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName]     = useState<string>(() => localStorage.getItem('userName') || '');
  const [error, setError]   = useState<string | null>(null);
  
  const userID = getOrCreateUserID();

  // 1️⃣ Connect once
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // on ack, navigate
    socket.on('sessionCreated', ({ sessionID }) => {
      navigate(`/session/${sessionID}`);
    });

    return () => {
      socket.off('sessionCreated');
    };
  }, [navigate]);

  const handleCreate = () => {
    setError(null);
    const trimmed = name.trim() || 'Anonymous';
    if (trimmed.length > MAX_NAME_LENGTH) {
      return setError(`Name ≤ ${MAX_NAME_LENGTH} chars`);
    }
    localStorage.setItem('userName', trimmed);

    // emit createRoom → server will reply with sessionCreated + initial fetchData
    socket.emit('createRoom', { user: { userID, userName: trimmed } });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Create a New Session
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Your Name"
          variant="outlined"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          inputProps={{ maxLength: MAX_NAME_LENGTH }}
          helperText={`${name.length}/${MAX_NAME_LENGTH}`}
          fullWidth
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button variant="contained" size="large" onClick={handleCreate}>
          Create Session
        </Button>
      </Box>
    </Container>
  );
};

export default CreateSessionPage;
