import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function JoinSessionPage() {
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle actual join logic (e.g., verify session ID)
    navigate(`/session/${sessionId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Join Session
      </Typography>
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
                <Button type="submit" variant="contained" fullWidth>
                  Join Session
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
