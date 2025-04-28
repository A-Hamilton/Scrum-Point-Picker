import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

const HomePage: React.FC = () => (
  <Container sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h4" gutterBottom>
      Scrum Point Picker
    </Typography>
    <Button component={Link} to="/create" variant="contained" sx={{ m: 1 }}>
      Create Session
    </Button>
    <Button component={Link} to="/join" variant="outlined" sx={{ m: 1 }}>
      Join Session
    </Button>
  </Container>
);

export default HomePage;
