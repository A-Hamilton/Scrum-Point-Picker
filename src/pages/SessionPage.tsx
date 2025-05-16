// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ParticipantCard from '../components/ParticipantCard';
import VoteOptionCard from '../components/VoteOptionCard';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';
import { socket } from '../socket';
// ← Import your helper
import medianRound from '../utils/medianRound';

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
  const navigate = useNavigate();
  const userID = getOrCreateUserID();
  const userName = localStorage.getItem('userName') || 'Anonymous';

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    if (!sessionID) return;
    if (!socket.connected) socket.connect();
    socket.emit('joinRoom', { sessionID, user: { userID, userName } });

    socket.on(`fetchData-${sessionID}`, (data: SessionData) => {
      setSession(data);
      setTitleInput(data.title);
      setLoading(false);
    });
    socket.on(`revealUpdated-${sessionID}`, ({ showVote }) =>
      setSession((s) => (s ? { ...s, showVote } : s))
    );
    socket.on(`votesUpdated-${sessionID}`, (members: Member[]) =>
      setSession((s) => (s ? { ...s, members } : s))
    );
    socket.on(`titleUpdated-${sessionID}`, ({ title }) =>
      setSession((s) => (s ? { ...s, title } : s))
    );
    socket.on(`nameUpdated-${sessionID}`, ({ userID: uid, newName }) =>
      setSession((s) =>
        s
          ? {
              ...s,
              members: s.members.map((m) =>
                m.userID === uid ? { ...m, userName: newName } : m
              ),
            }
          : s
      )
    );
    socket.on('sessionDeleted', () => {
      alert('Session deleted');
      navigate('/create', { replace: true });
    });

    return () => {
      socket.off(`fetchData-${sessionID}`);
      socket.off(`revealUpdated-${sessionID}`);
      socket.off(`votesUpdated-${sessionID}`);
      socket.off(`titleUpdated-${sessionID}`);
      socket.off(`nameUpdated-${sessionID}`);
      socket.off('sessionDeleted');
    };
  }, [sessionID, userID, userName, navigate]);

  // UI action handlers
  const saveTitle = () => {
    if (sessionID && titleInput.trim()) {
      socket.emit('updateTitle', { sessionID, title: titleInput.trim() });
    }
  };
  const castVote = (vote: number) => {
    if (sessionID) socket.emit('vote', { sessionID, userID, vote });
  };

  // Reveal with vote-count check
  const handleReveal = () => {
    if (!session) return;
    const total = session.members.length;
    const voted = session.members.filter((m) => m.vote !== null).length;
    if (voted === 0) return; // button is disabled
    if (voted < total) {
      if (!window.confirm(`Only ${voted}/${total} voted. Reveal anyway?`)) {
        return;
      }
    }
    socket.emit('reveal', { sessionID });
  };

  const handleReset = () => {
    if (sessionID) socket.emit('reset', { sessionID });
  };
  const handleDelete = () => {
    if (window.confirm('Delete this session for everyone?')) {
      socket.emit('deleteSession', { sessionID });
    }
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard');
  };
  const updateName = (uid: string, newName: string) => {
    if (sessionID)
      socket.emit('updateUserName', { sessionID, userID: uid, newName });
  };

  if (loading || !session) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  // ── USE YOUR medianRound HELPER ─────────────────────────────────────────────
  const numericVotes = session.members
    .map((m) => m.vote)
    .filter((v): v is number => v !== null);
  const median = medianRound(numericVotes);

  // ── DETERMINE IF WE CAN REVEAL ──────────────────────────────────────────────
  const canReveal =
    !session.showVote && numericVotes.length > 0;

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
            <Tooltip title="Copy session link">
              <IconButton onClick={handleCopyLink}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleReveal}
              disabled={!canReveal}
              sx={{ mr: 1 }}
            >
              Reveal
            </Button>
            <Button variant="outlined" onClick={handleReset} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              startIcon={<DeleteIcon />}
            >
              Delete
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
