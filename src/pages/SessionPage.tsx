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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ParticipantCard, { Participant } from '../components/ParticipantCard';
import VoteOptionCard from '../components/VoteOptionCard';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';
import { socket } from '../socket';
import medianRound from '../utils/medianRound';

interface SessionData {
  id: string;
  title: string;
  creatorId: string;
  members: Participant[];
  showVote: boolean;
}

const SessionPage: React.FC = () => {
  const { sessionID } = useParams<{ sessionID: string }>();
  const navigate = useNavigate();
  const userID = getOrCreateUserID();
  const userName = localStorage.getItem('userName') || 'Anonymous';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    socket.on(`votesUpdated-${sessionID}`, (members: Participant[]) =>
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

  // Handlers
  const saveTitle = () => {
    if (sessionID && titleInput.trim()) {
      socket.emit('updateTitle', { sessionID, title: titleInput.trim() });
    }
  };
  const castVote = (vote: number) => {
    if (sessionID) socket.emit('vote', { sessionID, userID, vote });
  };
  const handleReveal = () => {
    if (!session) return;
    const total = session.members.length;
    const votedCount = session.members.filter((m) => m.vote !== null).length;
    if (votedCount === 0) return;
    if (
      votedCount < total &&
      !window.confirm(`Only ${votedCount}/${total} voted. Reveal anyway?`)
    ) {
      return;
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

  // Median
  const votes = session.members
    .map((m) => m.vote)
    .filter((v): v is number => v !== null);
  const median = medianRound(votes);

  // Can reveal?
  const canReveal = !session.showVote && votes.length > 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }} elevation={4}>
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
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={m.userID}>
              <ParticipantCard
                participant={m}
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

        {isMobile ? (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              py: 1,
              px: 1,
              gap: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {[0, 1, 2, 3, 5, 8, 13, 21].map((opt) => {
              const me = session.members.find((m) => m.userID === userID);
              const selected = me?.vote === opt;
              return (
                <VoteOptionCard
                  key={opt}
                  option={opt}
                  selected={selected}
                  onClick={() => castVote(opt)}
                  disabled={session.showVote}
                />
              );
            })}
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {[0, 1, 2, 3, 5, 8, 13, 21].map((opt) => {
              const me = session.members.find((m) => m.userID === userID);
              const selected = me?.vote === opt;
              return (
                <Grid item key={opt}>
                  <VoteOptionCard
                    option={opt}
                    selected={selected}
                    onClick={() => castVote(opt)}
                    disabled={session.showVote}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}

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
