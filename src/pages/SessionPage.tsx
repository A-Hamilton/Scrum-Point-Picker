import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useSession, Ticket } from '../context/SessionContext';
import ParticipantCard from '../components/ParticipantCard';

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    sessions,
    castVote,
    revealVotes,
    resetVotes,
    addTicket,
    deleteTicket,
    deleteSession,
  } = useSession();

  const session = id ? sessions[id] : undefined;
  const [loading, setLoading] = useState(true);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true });
      return;
    }
    setLoading(false);
  }, [session, navigate]);

  if (loading || !session) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const isMod = session.moderator === 'Moderator'; // replace with real user check
  const handleAddTicket = () => {
    if (!newTicketTitle.trim()) return;
    addTicket(session.id, newTicketTitle.trim());
    setNewTicketTitle('');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Session: {session.name}</Typography>
        {isMod && (
          <Button color="error" onClick={() => { deleteSession(session.id); navigate('/'); }}>
            End Session
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" gutterBottom>
        Participants
      </Typography>
      {session.participants.length === 0 ? (
        <Typography>No participants yet</Typography>
      ) : (
        <Grid container spacing={2} mb={4}>
          {session.participants.map((u) => (
            <Grid item xs={12} md={4} key={u}>
              <ParticipantCard
                participant={{ name: u, voted: false, vote: null }}
                revealed={session.revealed}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {isMod && (
        <Box mb={4}>
          <Typography variant="h6">Add New Ticket</Typography>
          <Box display="flex" gap={2} alignItems="center" mt={1}>
            <TextField
              label="Ticket Title"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddTicket}>
              Add
            </Button>
          </Box>
          <Grid container spacing={2} mt={2}>
            {session.tickets.map((t: Ticket) => (
              <Grid item key={t.id}>
                <Card>
                  <CardContent>
                    <Typography>{t.title}</Typography>
                    <Button color="error" size="small" onClick={() => deleteTicket(session.id, t.id)}>
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Cast Your Vote
      </Typography>
      <Grid container spacing={1} mb={2}>
        {session.tickets.length === 0 ? (
          <Typography>No tickets added yet</Typography>
        ) : (
          session.tickets.map((t) => (
            <Grid item key={t.id}>
              <Button
                variant="contained"
                onClick={() => castVote(session.id, t.id, 'You', 5)}
                disabled={session.revealed}
              >
                Vote 5 on "{t.title}"
              </Button>
            </Grid>
          ))
        )}
      </Grid>

      <Box>
        <Button variant="outlined" onClick={() => revealVotes(session.id)} sx={{ mr: 2 }}>
          Reveal Votes
        </Button>
        <Button variant="outlined" onClick={() => resetVotes(session.id)}>
          Restart Voting
        </Button>
      </Box>
    </Container>
  );
};

export default SessionPage;
