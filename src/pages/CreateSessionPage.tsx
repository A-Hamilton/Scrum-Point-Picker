import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, TextField, Typography } from '@mui/material';
import requestSession from '../utils/requestSession';

const CreateSessionPage: React.FC = () => {
  const [sessionID, setSessionID] = useState<string>('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    const id = await requestSession();
    setSessionID(id);
  };

  const enterSession = () => {
    navigate(`/session/${sessionID}`);
  };

  return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Create a new session</Typography>
      <Button onClick={handleCreate} variant="contained">Generate ID</Button>
      {sessionID && (
        <>
          <TextField
            label="Session ID"
            value={sessionID}
            variant="outlined"
            margin="normal"
            fullWidth
            disabled
          />
          <Button onClick={enterSession} variant="contained" color="secondary">
            Enter Session
          </Button>
        </>
      )}
    </Container>
  );
};

export default CreateSessionPage;
