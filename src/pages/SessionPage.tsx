import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import ParticipantCard, { Participant } from '../components/ParticipantCard';

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // simulate fetch
    setTimeout(() => {
      setParticipants([
        { name: 'Alice', voted: true, vote: 5 },
        { name: 'Bob', voted: false, vote: null },
      ]);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleVote = (value: number) => {
    setParticipants((prev) =>
      prev.map((p, i) =>
        i === 0 ? { ...p, voted: true, vote: value } : p
      )
    );
  };

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Session: {id}
      </Typography>
      {participants.length === 0 ? (
        <Typography>No participants yet</Typography>
      ) : (
        <Grid container spacing={2}>
          {participants.map((p, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <ParticipantCard participant={p} revealed={revealed} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        {!revealed && (
          <>
            <Typography variant="h6">Cast Your Vote</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {[1, 2, 3, 5, 8, 13].map((v) => (
                <Grid item key={v}>
                  <Button
                    variant="contained"
                    onClick={() => handleVote(v)}
                    disabled={revealed}
                  >
                    {v}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setRevealed(true)}
            sx={{ mr: 2 }}
          >
            Reveal Votes
          </Button>
          <Button variant="outlined" onClick={() => {
            setRevealed(false);
            setParticipants((prev) =>
              prev.map((p) => ({ ...p, voted: false, vote: null }))
            );
          }}>
            Restart
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SessionPage;
