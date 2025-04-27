import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CreateSessionPage() {
  const [sessionName, setSessionName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle actual session creation logic (e.g., call API)
    const dummySessionId = '12345'; // Example session ID
    navigate(`/session/${dummySessionId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Session
      </Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Session Name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              {/* Additional fields (e.g., deck type) can be added here */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth>
                  Create Session
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
