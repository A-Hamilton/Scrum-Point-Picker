// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ParticipantCard from '../components/ParticipantCard';
import VoteOptionCard from '../components/VoteOptionCard';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';

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
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // **Same stable userID**:
  const userID = getOrCreateUserID();
  const userName = localStorage.getItem('userName') || 'Anonymous';

  const [isEditingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const [socket] = useState<Socket>(() =>
    io(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : `${window.location.protocol}//${window.location.host}`,
      { autoConnect: false, transports: ['websocket'] }
    )
  );

  useEffect(() => {
    if (!sessionID) return;
    setLoading(true);
    socket.connect();
    socket.emit('joinRoom', {
      sessionID,
      user: { userID, userName },
    });

    socket.on(`fetchData-${sessionID}`, (data: SessionData) => {
      setSession(data);
      setLoading(false);
    });
    socket.on(`titleUpdated-${sessionID}`, ({ title }) =>
      setSession((s) => (s ? { ...s, title } : s))
    );
    socket.on(`votesUpdated-${sessionID}`, (members: Member[]) =>
      setSession((s) => (s ? { ...s, members } : s))
    );
    socket.on(`revealUpdated-${sessionID}`, ({ showVote }) =>
      setSession((s) => (s ? { ...s, showVote } : s))
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

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [sessionID, socket, userID, userName]);

  useEffect(() => {
    if (session) setTitleInput(session.title);
  }, [session?.title]);

  const saveTitle = () => {
    if (!sessionID || !titleInput.trim()) return;
    socket.emit('updateTitle', {
      sessionID,
      title: titleInput.trim(),
    });
    setEditingTitle(false);
  };
  const castVote = (vote: number) =>
    sessionID && socket.emit('vote', { sessionID, userID, vote });
  const handleReveal = () =>
    sessionID && socket.emit('reveal', { sessionID });
  const handleReset = () =>
    sessionID && socket.emit('reset', { sessionID });
  const updateName = (uid: string, newName: string) => {
    if (!sessionID) return;
    socket.emit('updateUserName', { sessionID, userID: uid, newName });
    if (uid === userID) {
      localStorage.setItem('userName', newName);
    }
  };

  if (loading || !session) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}
      >
        {/* header, participants, vote‐buttons… identical to before */}
        {/* … */}
      </Paper>
    </Container>
  );
};

export default SessionPage;
