import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Button,
  Typography,
  TextField
} from '@mui/material';
import { socket } from '../socket';
import getUser from '../utils/getUser';
import requestSession from '../utils/requestSession';
import joinSession from '../utils/joinSession';
import showVotes from '../utils/showVotes';
import clearVotes from '../utils/clearVotes';
import addParticipant from '../utils/addParticipant';
import VoteCard from '../components/VoteCard';

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
  const [newName, setNewName] = useState<string>('');

  // Create or join session, then join socket room
  useEffect(() => {
    (async () => {
      let id = routeID ?? '';
      if (routeID) {
        // Joining an existing session
        await joinSession(routeID);
      } else {
        // Creating a new session
        id = await requestSession();
        setSessionID(id);
        await joinSession(id);
      }
      socket.emit('joinRoom', id);
    })();
  }, [routeID]);

  // Listen for live session updates
  useEffect(() => {
    if (!sessionID) return;
    const event = `fetchData-${sessionID}`;
    socket.on(event, (data: SessionData) => {
      setSession(data);
    });
    return () => {
      socket.off(event);
    };
  }, [sessionID]);

  const castVote = (vote: number) => {
    socket.emit('vote', { sessionID, user: getUser(), vote });
  };

  if (!session) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Session: {session.id}
      </Typography>

      <Grid container spacing={2}>
        {session.members.map((m) => (
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

      {/* Spawn test participants in this window */}
      <div style={{ marginTop: 16 }}>
        <TextField
          label="Test name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button
          onClick={async () => {
            if (!newName.trim()) return;
            await addParticipant(sessionID, newName.trim());
            setNewName('');
          }}
          variant="outlined"
          size="small"
        >
          Spawn Test Participant
        </Button>
      </div>
    </Container>
  );
};

export default SessionPage;
