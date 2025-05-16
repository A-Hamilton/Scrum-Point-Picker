import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const JoinSession: React.FC = () => {
  const [name, setName]     = useState('');
  const [sessionId, setSid] = useState('');
  const navigate = useNavigate();

  const join = () => {
    const n = name.trim();
    const s = sessionId.trim();
    if (!n || !s) return;
    navigate(`/${s}`, {
      state: { userID: uuidv4(), userName: n }
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
        onChange={e => setSid(e.target.value)}
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
        <Button fullWidth variant="contained" onClick={join}>
          Join Session
        </Button>
      </Box>
    </Container>
  );
};

export default JoinSession;