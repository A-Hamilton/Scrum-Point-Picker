// src/pages/CreateSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import requestSession from '../utils/requestSession';

const CreateSessionPage: React.FC = () => {
  const [sessionID, setSessionID] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const id = await requestSession();
      setSessionID(id);
    } catch {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const enterSession = () => {
    navigate(`/session/${sessionID}`);
  };

  return (
    <Container sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Create a new session
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        onClick={handleCreate}
        variant="contained"
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Session ID'}
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
            onClick={enterSession}
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
