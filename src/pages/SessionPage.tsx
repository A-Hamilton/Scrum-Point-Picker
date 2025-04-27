import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Box, Button, CircularProgress } from '@mui/material';
import ParticipantCard from '../components/ParticipantCard';

export default function SessionPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // TODO: Fetch session data from backend using `id`
    // Simulate loading
    setTimeout(() => {
      setParticipants([
        { name: 'Alice', voted: true, vote: 5 },
        { name: 'Bob', voted: false, vote: null },
      ]);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleRestart = () => {
    setRevealed(false);
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, voted: false, vote: null }))
    );
  };

  const handleVote = (value) => {
    // TODO: Submit vote for current user
    // For demo, mark first participant as voted
    setParticipants((prev) =>
      prev.map((p, idx) =>
        idx === 0 ? { ...p, voted: true, vote: value } : p
      )
    );
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading session...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Session ID: {id}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Invite others to join this session using the session ID above.
      </Typography>

      {participants.length === 0 ? (
        <Typography>No participants yet</Typography>
      ) : (
        <Grid container spacing={2}>
          {participants.map((participant, index) => (
            <Grid item xs={12} md={4} key={index}>
              <ParticipantCard participant={participant} revealed={revealed} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        {!revealed && (
          <>
            <Typography variant="h6">Select Your Vote</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {[1, 2, 3, 5, 8, 13].map((point) => (
                <Grid item key={point}>
                  <Button
                    variant="contained"
                    onClick={() => handleVote(point)}
                    disabled={revealed}
                  >
                    {point}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleReveal} sx={{ mr: 2 }}>
            Reveal Votes
          </Button>
          <Button variant="outlined" onClick={handleRestart}>
            Restart Session
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
