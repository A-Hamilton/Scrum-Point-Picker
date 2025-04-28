// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [sessionID, setSessionID] = useState<string>(routeID || '');
  const [session, setSession]     = useState<SessionData | null>(null);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string>('');

  // 1) Create or JOIN, then socket-join and let the server add the user exactly once
  useEffect(() => {
    (async () => {
      try {
        let id = routeID ?? '';

        if (routeID) {
          // Joining an existing session: tell server via REST
          await joinSession(routeID);
        } else {
          // Creating a new session: get ID, store locally
          id = await requestSession();
          setSessionID(id);
          // DO NOT call joinSession here – let socket 'joinRoom' add us
        }

        // Finally, connect via socket and register this user
        socket.emit('joinRoom', { sessionID: id, user: getUser() });
      } catch {
        setError('Session no longer exists.');
      } finally {
        setLoading(false);
      }
    })();
  }, [routeID]);

  // 2) Subscribe to live session updates
  useEffect(() => {
    if (!sessionID) return;
    const evt = `fetchData-${sessionID}`;
    const handler = (data: SessionData) => setSession(data);
    socket.on(evt, handler);
    return () => {
      socket.off(evt, handler);
    };
  }, [sessionID]);

  // Vote action
  const castVote = (vote: number) =>
    socket.emit('vote', { sessionID, user: getUser(), vote });

  // Loading state
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state: show navigation buttons
  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
          sx={{ mr: 1 }}
        >
          Create Session
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/join')}
        >
          Join Session
        </Button>
      </Container>
    );
  }

  // No session data (should be rare)
  if (!session) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography gutterBottom>No session data available.</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
          sx={{ mr: 1 }}
        >
          Create Session
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/join')}
        >
          Join Session
        </Button>
      </Container>
    );
  }

  // Compute consensus (median snapped to valid options)
  const consensus = session.showVote
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
