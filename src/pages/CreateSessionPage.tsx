import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography
} from '@mui/material';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';
import { socket } from '../socket';

const MAX_NAME_LENGTH = 20;

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(() => localStorage.getItem('userName') || '');
  const [error, setError] = useState<string | null>(null);

  const userID = getOrCreateUserID();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleSessionCreated = ({ sessionID }: { sessionID: string }) => {
      navigate(`/session/${sessionID}`);
    };
    socket.on('sessionCreated', handleSessionCreated);

    return () => {
      socket.off('sessionCreated', handleSessionCreated);
    };
  }, [navigate]);

  const handleCreate = () => {
    setError(null);
    const trimmed = name.trim() || 'Anonymous';
    if (trimmed.length > MAX_NAME_LENGTH) {
      return setError(`Name must be ≤ ${MAX_NAME_LENGTH} characters.`);
    }
    localStorage.setItem('userName', trimmed);

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