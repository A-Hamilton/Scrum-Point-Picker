import React from 'react';
import { Container, Typography, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => (
  <Container sx={{ mt: 4, textAlign: 'center' }}>
    <Typography variant="h3" gutterBottom>
      Scrum Point Picker
    </Typography>
    <Typography variant="body1" gutterBottom>
      Collaboratively vote on your agile tickets.
    </Typography>
    <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
      <Grid item>
        <Button variant="contained" component={RouterLink} to="/create">
          Create Session
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" color="secondary" component={RouterLink} to="/join">
          Join Session
        </Button>
      </Grid>
    </Grid>
  </Container>
);

export default HomePage;
