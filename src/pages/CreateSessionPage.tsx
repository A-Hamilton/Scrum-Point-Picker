import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, TextField, Typography } from '@mui/material';
import requestSession from '../utils/requestSession';

const CreateSessionPage: React.FC = () => {
  const [sessionID, setSessionID] = useState<string>('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    const id = await requestSession();
    setSessionID(id);
  };

  return (
    <Container sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Create a new session
      </Typography>
      <Button onClick={handleCreate} variant="contained">
        Generate Session ID
      </Button>
      {sessionID && (
        <>
          <TextField
            label="Your Session ID"
            value={sessionID}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <Button
            onClick={() => navigate(`/session/${sessionID}`)}
            variant="contained"
            color="secondary"
          >
            Enter Session
          </Button>
        </>
      )}
    </Container>
  );
};

export default CreateSessionPage;
