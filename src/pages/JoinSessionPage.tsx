import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, TextField, Typography } from '@mui/material';
import joinSession from '../utils/joinSession';

const JoinSessionPage: React.FC = () => {
  const [sessionID, setSessionID] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!sessionID.trim()) {
      alert('Please enter a session ID');
      return;
    }
    await joinSession(sessionID);
    navigate(`/session/${sessionID}`);
  };

  return (
    <Container sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Join an existing session
      </Typography>
      <TextField
        label="Session ID"
        value={sessionID}
        onChange={e => setSessionID(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button onClick={handleJoin} variant="contained">
        Join
      </Button>
    </Container>
  );
};

export default JoinSessionPage;
