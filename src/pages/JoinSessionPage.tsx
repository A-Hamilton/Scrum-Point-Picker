// src/pages/JoinSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import joinSession from '../utils/joinSession';

export default function JoinSessionPage() {
  const [userName, setUserName] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !sessionId.trim()) {
      setError('Please enter both your name and session ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Persist this user
      const id = crypto.randomUUID().substr(0, 12);
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('userID', id);
      await joinSession(sessionId.trim());
      navigate(`/session/${sessionId.trim()}`);
    } catch {
      setError('Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Join Session
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Join Session'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
