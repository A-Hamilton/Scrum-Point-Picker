// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { socket } from '../socket';
import getUser from '../utils/getUser';
import requestSession from '../utils/requestSession';
import joinSession from '../utils/joinSession';
import showVotes from '../utils/showVotes';
import clearVotes from '../utils/clearVotes';
import VoteCard from '../components/VoteCard';
import medianRound from '../utils/medianRound';

interface Member {
  userID: string;
  userName: string;
  vote: number | null;
}
interface SessionData {
  id: string;
  members: Member[];
  showVote: boolean;
}

const SessionPage: React.FC = () => {
  const { id: routeID } = useParams<{ id: string }>();
  const [sessionID, setSessionID] = useState<string>(routeID || '');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Step 1: Create or join session, then join Socket.IO room
  useEffect(() => {
    (async () => {
      try {
        let id = routeID ?? '';
        if (routeID) {
          await joinSession(routeID);
        } else {
          id = await requestSession();
          setSessionID(id);
        }
        socket.emit('joinRoom', id);
      } catch {
        setError('Failed to create or join session.');
      } finally {
        setLoading(false);
      }
    })();
  }, [routeID]);

  // Step 2: Listen for real-time session updates
  useEffect(() => {
    if (!sessionID) return;
    const event = `fetchData-${sessionID}`;
    const handler = (data: SessionData) => setSession(data);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [sessionID]);

  // Vote casting
  const castVote = (vote: number) => {
    socket.emit('vote', { sessionID, user: getUser(), vote });
  };

  // Loading / error / empty states
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!session) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>No session data.</Typography>
      </Container>
    );
  }

  // Compute the median‐rounded story point when votes are shown
  const consensus =
    session.showVote
      ? medianRound(session.members.map(m => m.vote))
      : null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Session: {session.id}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {session.members.length} participant
        {session.members.length !== 1 ? 's' : ''} joined.
        {consensus !== null && ` Consensus: ${consensus}`}
      </Typography>

      <Grid container spacing={2}>
        {session.members.map(m => (
          <Grid item key={m.userID} xs={12} sm={6} md={4} lg={3}>
            <VoteCard
              userName={m.userName}
              vote={session.showVote ? m.vote : null}
              onVote={castVote}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        onClick={() => showVotes(sessionID)}
        variant="contained"
        sx={{ mt: 2, mr: 1 }}
      >
        Show Votes
      </Button>
      <Button
        onClick={() => clearVotes(sessionID)}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Clear Votes
      </Button>
    </Container>
  );
};

export default SessionPage;
