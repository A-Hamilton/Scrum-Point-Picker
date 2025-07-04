import { Container, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Agile Ticket Voter
      </Typography>
      <Typography variant="body1" gutterBottom>
        Collaborate with your team to estimate story points. Create a new session or join an existing one to begin.
      </Typography>
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Grid item>
          <Button variant="contained" component={Link} to="/create">
            Create Session
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" component={Link} to="/join">
            Join Session
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}