import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CreateSessionPage() {
  const [sessionName, setSessionName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
            <Grid container spacing={2} direction="column" component="div">
              <Grid>
                <TextField
                  label="Session Name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid>
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
