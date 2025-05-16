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
    console.log('🔄 SessionPage mount for', sessionID);

    // 1️⃣ (Re)connect the shared socket
    if (socket.connected) {
      console.log('⚠️ socket already connected, disconnecting first');
      socket.disconnect();
    }
    console.log('🔌 Connecting socket…');
    socket.connect();

    // 2️⃣ Once connected, emit joinRoom
    socket.once('connect', () => {
      console.log('✅ socket connected (id=', socket.id, ')');
      console.log('➡️ Emitting joinRoom', { sessionID, userID, userName });
      socket.emit('joinRoom', {
        sessionID,
        user: { userID, userName },
      });

      // 3️⃣ DEBUG: log all incoming events
      socket.onAny((eventName, ...args) => {
        console.log('🐛 SOCKET EVENT:', eventName, args);
      });
    });

    // 4️⃣ Your session‐payload handler
    const handleFetch = (data: SessionData) => {
      console.log('📥 handleFetch =>', data);
      setSession(data);
      setTitleInput(data.title);
      setLoading(false);
    };

    // 5️⃣ Listen for both the expected and any other payload event
    socket.on(`fetchData-${sessionID}`, handleFetch);
    socket.on('fetchData', handleFetch);
    // If you discover (via the logs) that your server actually uses, say, 'sessionData',
    // replace/add:
    //   socket.on('sessionData', handleFetch);

    // 6️⃣ Other updates
    socket.on(`titleUpdated-${sessionID}`, ({ title }) => {
      console.log('🔤 titleUpdated:', title);
      setSession((s) => (s ? { ...s, title } : s));
    });
    socket.on(`votesUpdated-${sessionID}`, (members: Member[]) => {
      console.log('✏️ votesUpdated:', members);
      setSession((s) => (s ? { ...s, members } : s));
    });
    socket.on(`revealUpdated-${sessionID}`, ({ showVote }) => {
      console.log('👁 revealUpdated:', showVote);
      setSession((s) => (s ? { ...s, showVote } : s));
    });
    socket.on(`nameUpdated-${sessionID}`, ({ userID: uid, newName }) => {
      console.log('🖋 nameUpdated:', uid, newName);
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
      console.log('🧹 Cleaning up listeners for', sessionID);
      socket.off(`fetchData-${sessionID}`, handleFetch);
      socket.off('fetchData', handleFetch);
      // if you added 'sessionData', also remove it here:
      // socket.off('sessionData', handleFetch);
      socket.off(`titleUpdated-${sessionID}`);
      socket.off(`votesUpdated-${sessionID}`);
      socket.off(`revealUpdated-${sessionID}`);
      socket.off(`nameUpdated-${sessionID}`);
      socket.offAny(); // remove the debug logger
      // do NOT socket.disconnect() here so other pages can reuse it
    };
  }, [sessionID, userID, userName]);

  // Handlers
  const saveTitle = () => {
    if (!sessionID || !titleInput.trim()) return;
    console.log('✏️ Emitting updateTitle', titleInput.trim());
    socket.emit('updateTitle', { sessionID, title: titleInput.trim() });
  };
  const castVote = (vote: number) => {
    console.log('🎯 Emitting vote', vote);
    if (sessionID) socket.emit('vote', { sessionID, userID, vote });
  };
  const handleReveal = () => {
    console.log('👁 Emitting reveal');
    if (sessionID) socket.emit('reveal', { sessionID });
  };
  const handleReset = () => {
    console.log('🔄 Emitting reset');
    if (sessionID) socket.emit('reset', { sessionID });
  };
  const updateName = (uid: string, newName: string) => {
    console.log('🖊 Emitting updateUserName', uid, newName);
    if (sessionID)
      socket.emit('updateUserName', { sessionID, userID: uid, newName });
  };

  // Loading state
  if (loading || !session) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Main UI
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Grid container alignItems="center" spacing={2} mb={3}>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              size="small"
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
            const disabled = me?.vote !== null && !session.showVote;
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
      </Paper>
    </Container>
  );
};

export default SessionPage;
