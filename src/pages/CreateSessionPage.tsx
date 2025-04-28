// src/pages/CreateSessionPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();

  const [sessionName, setSessionName] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createSession = async () => {
    setError('');
    setLoading(true);
    try {
      // send title; backend will default to 'New Session' if blank
      const payload = { title: sessionName || 'New Session' };
      const { data } = await axios.post<string>('http://localhost:4000/createSession', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // data is the raw sessionID string
      setSessionID(data);
    } catch (e: any) {
      setError(e.response?.data || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const enterSession = () => {
    if (!sessionID) {
      setError('Please generate a Session ID first');
      return;
    }
    navigate(`/session/${sessionID}`);
  };

  return (
    <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: { xs: '100%', sm: 400 } }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Create a New Session
        </Typography>

        <Box sx={{ my: 2 }}>
          <TextField
            fullWidth
            label="Session Name"
            placeholder="Enter a name (optional)"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={createSession}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Session ID'}
        </Button>

        <TextField
          fullWidth
          label="Your Session ID"
          value={sessionID}
          placeholder="No session generated yet"
          InputProps={{ readOnly: true }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={enterSession}
        >
          Enter Session
        </Button>
      </Paper>
    </Container>
  );
};

export default CreateSessionPage;
