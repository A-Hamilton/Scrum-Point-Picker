import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const JoinSession: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const trimmedId = sessionId.trim();
    const trimmedName = name.trim();
    if (!trimmedId || !trimmedName) return;
    navigate(`/${trimmedId}`, {
      state: { userID: uuidv4(), userName: trimmedName }
    });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Join an Existing Session
      </Typography>
      <TextField
        label="Session ID"
        value={sessionId}
        onChange={e => setSessionId(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Box sx={{ mt: 2 }}>
        <Button fullWidth variant="contained" onClick={handleJoin}>
          Join Session
        </Button>
      </Box>
    </Container>
  );
};

export default JoinSession;