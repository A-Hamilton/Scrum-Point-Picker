import React, { useState, FormEvent } from 'react';
import { Container, Typography, TextField, Button, Grid, Card, CardContent, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const JoinSessionPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { sessions, joinSession } = useSession();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!userName.trim() || !sessionId.trim()) {
      setError('Name and Session ID are required');
      return;
    }
    const session = sessions[sessionId];
    if (!session) {
      setError('Session not found');
      return;
    }
    if (session.participants.includes(userName.trim())) {
      setError('Name already taken in this session');
      return;
    }
    joinSession(sessionId, userName.trim());
    navigate(`/session/${sessionId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Join Session
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
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
                <Button type="submit" variant="contained" fullWidth>
                  Join Session
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JoinSessionPage;
