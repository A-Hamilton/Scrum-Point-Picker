// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Button, Typography } from '@mui/material';
import { socket } from '../socket';
import getUser from '../utils/getUser';
import requestSession from '../utils/requestSession';
import joinSession from '../utils/joinSession';
import showVotes from '../utils/showVotes';
import clearVotes from '../utils/clearVotes';
import VoteCard from '../components/VoteCard';

interface Member { userID: string; userName: string; vote: number | null; }
interface SessionData { id: string; members: Member[]; showVote: boolean; }

const SessionPage: React.FC = () => {
  const { id: routeID } = useParams<{ id: string }>();
  const [sessionID, setSessionID] = useState<string>(routeID || '');
  const [session, setSession] = useState<SessionData | null>(null);

  // On mount: if routeID exists, JOIN; otherwise CREATE
  useEffect(() => {
    (async () => {
      if (routeID) {
        await joinSession(routeID);
      } else {
        const newID = await requestSession();
        setSessionID(newID);
      }
      socket.emit('joinRoom', routeID || sessionID);
    })();
  }, [routeID, sessionID]);

  // Subscribe to updates for this session
  useEffect(() => {
    if (!sessionID) return;
    const evt = `fetchData-${sessionID}`;
    socket.on(evt, (data: SessionData) => setSession(data));
    return () => { socket.off(evt); };
  }, [sessionID]);

  const castVote = (vote: number) => socket.emit(
    'vote',
    { sessionID, user: getUser(), vote }
  );

  if (!session) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Session: {session.id}
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
