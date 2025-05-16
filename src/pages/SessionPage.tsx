// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import ParticipantCard from '../components/ParticipantCard';
import VoteOptionCard from '../components/VoteOptionCard';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';
import { socket } from '../socket';

interface Member {
  userID: string;
  userName: string;
  vote: number | null;
}

interface SessionData {
  id: string;
  title: string;
  creatorId: string;
  members: Member[];
  showVote: boolean;
}

const SessionPage: React.FC = () => {
  const { sessionID } = useParams<{ sessionID: string }>();
  const userID = getOrCreateUserID();
  const userName = localStorage.getItem('userName') || 'Anonymous';

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    if (!sessionID) return;

    // Ensure socket is connected
    if (!socket.connected) socket.connect();

    // Join the room
    socket.emit('joinRoom', { sessionID, user: { userID, userName } });

    // Handler for initial session data
    const handleFetch = (data: SessionData) => {
      setSession(data);
      setTitleInput(data.title);
      setLoading(false);
    };
    socket.on(`fetchData-${sessionID}`, handleFetch);

    // Listen for reveal toggles
    socket.on(`revealUpdated-${sessionID}`, ({ showVote }) => {
      setSession((s) => (s ? { ...s, showVote } : s));
    });

    // Other update listeners
    socket.on(`titleUpdated-${sessionID}`, ({ title }) =>
      setSession((s) => (s ? { ...s, title } : s))
    );
    socket.on(`votesUpdated-${sessionID}`, (members: Member[]) =>
      setSession((s) => (s ? { ...s, members } : s))
    );
    socket.on(`nameUpdated-${sessionID}`, ({ userID: uid, newName }) => {
      setSession((s) =>
        s
          ? {
              ...s,
              members: s.members.map((m) =>
                m.userID === uid ? { ...m, userName: newName } : m
              ),
            }
          : s
      );
    });

    return () => {
      socket.off(`fetchData-${sessionID}`, handleFetch);
      socket.off(`revealUpdated-${sessionID}`);
      socket.off(`titleUpdated-${sessionID}`);
      socket.off(`votesUpdated-${sessionID}`);
      socket.off(`nameUpdated-${sessionID}`);
    };
  }, [sessionID, userID, userName]);

  // UI action handlers
  const saveTitle = () => {
    if (sessionID && titleInput.trim()) {
      socket.emit('updateTitle', { sessionID, title: titleInput.trim() });
    }
  };
  const castVote = (vote: number) => {
    if (sessionID) socket.emit('vote', { sessionID, userID, vote });
  };
  const handleReveal = () => {
    if (sessionID) socket.emit('reveal', { sessionID });
  };
  const handleReset = () => {
    if (sessionID) socket.emit('reset', { sessionID });
  };
  const updateName = (uid: string, newName: string) => {
    if (sessionID)
      socket.emit('updateUserName', { sessionID, userID: uid, newName });
  };

  // Spinner until data loads
  if (loading || !session) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  // ──────── MEDIAN CALCULATION ────────────────────────────────────────────────
  const votes = session.members
    .map((m) => m.vote)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  let median: number | null = null;
  if (votes.length) {
    const mid = Math.floor(votes.length / 2);
    median = votes.length % 2 === 1 ? votes[mid] : (votes[mid - 1] + votes[mid]) / 2;
  }

  // ──────── RENDER ─────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Grid container alignItems="center" spacing={2} mb={3}>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleReveal}
              disabled={session.showVote}
              sx={{ mr: 1 }}
            >
              Reveal
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Participants */}
        <Typography variant="h6" gutterBottom>
          Participants
        </Typography>
        <Grid container spacing={2} mb={4}>
          {session.members.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.userID}>
              <ParticipantCard
                participant={{
                  name: m.userName,
                  voted: m.vote !== null,
                  vote: m.vote,
                }}
                revealed={session.showVote}
                editable={m.userID === userID}
                onUpdateName={(n) => updateName(m.userID, n)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Vote Options */}
        <Typography variant="h6" gutterBottom>
          Vote Options
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {[0, 1, 2, 3, 5, 8, 13, 21].map((opt) => {
            const me = session.members.find((m) => m.userID === userID);
            const selected = me?.vote === opt;

            // ◀─ HERE: Only disable AFTER reveal
            const disabled = session.showVote;

            return (
              <Grid item key={opt}>
                <Box width={64} height={100}>
                  <VoteOptionCard
                    option={opt}
                    selected={selected}
                    onClick={() => castVote(opt)}
                    disabled={disabled}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Median */}
        {session.showVote && median !== null && (
          <Box mt={2} textAlign="center">
            <Typography variant="subtitle1">Median: {median}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SessionPage;
