// src/pages/SessionPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Grid,
  TextField,
  IconButton,
  Button,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { socket } from '../socket';
import getUser from '../utils/getUser';
import requestSession from '../utils/requestSession';
import joinSession from '../utils/joinSession';
import showVotes from '../utils/showVotes';
import clearVotes from '../utils/clearVotes';
import ParticipantCard from '../components/ParticipantCard';
import VoteOptionCard from '../components/VoteOptionCard';
import medianRound from '../utils/medianRound';

const OPTIONS = [1, 2, 3, 5, 8, 13, 21];
const LEGEND: Record<number, string> = {
  1: 'Under 1 week',
  2: 'Under 2 weeks',
  3: 'Under 4 weeks',
  5: 'Under 12 weeks',
  8: 'Under 24 weeks',
  13: 'Under 6 months',
  21: 'Over 6 months'
};

interface Member { userID: string; userName: string; vote: number | null; }
interface SessionData { id: string; title: string; creatorId: string; members: Member[]; showVote: boolean; }

const SessionPage: React.FC = () => {
  const { id: routeID } = useParams<{ id: string }>();
  const user = getUser();

  const [sessionID, setSessionID] = useState(routeID || '');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('New Session');
  const [editingTitle, setEditingTitle] = useState(false);

  // Join or create session
  useEffect(() => {
    (async () => {
      try {
        let sid = routeID || '';
        if (routeID) await joinSession(routeID);
        else { sid = await requestSession(); setSessionID(sid); }
        socket.emit('joinRoom', { sessionID: sid, user });
      } catch {
        setError('Session no longer exists.');
      } finally { setLoading(false); }
    })();
  }, [routeID, user]);

  // Listen for session data, title, and name updates
  useEffect(() => {
    if (!sessionID) return;
    const dataEvt = `fetchData-${sessionID}`;
    const titleEvt = `titleUpdated-${sessionID}`;
    const nameEvt = `nameUpdated-${sessionID}`;

    const handleData = (data: SessionData) => {
      console.log('fetchData received:', data);
      setSession(data);
      setTitle(data.title);
    };
    const handleTitle = ({ title: newT }: { title: string }) => {
      console.log('titleUpdated:', newT);
      setTitle(newT);
    };
    const handleName = ({ userID, newName }: { userID: string; newName: string }) => {
      console.log('nameUpdated:', userID, newName);
      setSession(prev => prev && ({
        ...prev,
        members: prev.members.map(m =>
          m.userID === userID ? { ...m, userName: newName } : m
        )
      }));
    };

    socket.on(dataEvt, handleData);
    socket.on(titleEvt, handleTitle);
    socket.on(nameEvt, handleName);
    return () => {
      socket.off(dataEvt, handleData);
      socket.off(titleEvt, handleTitle);
      socket.off(nameEvt, handleName);
    };
  }, [sessionID]);

  const saveTitle = () => {
    setEditingTitle(false);
    socket.emit('updateTitle', { sessionID, title });
  };
  const castVote = (n: number) => socket.emit('vote', { sessionID, user, vote: n });
  const updateName = (userID: string, newName: string) => socket.emit('updateUserName', { sessionID, userID, newName });

  if (loading) return <Container sx={{ mt:4, textAlign:'center' }}><CircularProgress/></Container>;
  if (error) return <Container sx={{ mt:4, textAlign:'center' }}><Alert severity="error">{error}</Alert></Container>;
  if (!session) return null;

  const unique = Array.from(new Map(session.members.map(m => [m.userID, m])).values());
  const votedCount = unique.filter(m => m.vote != null).length;
  const total = unique.length;
  const pct = total ? (votedCount/total)*100 : 0;
  const consensus = session.showVote ? medianRound(unique.map(m => m.vote)) : null;

  return (
    <Container sx={{ mt:4 }}>
      <Paper sx={{ p:4 }}>
        <LinearProgress variant="determinate" value={pct} sx={{ mb:2 }} />
        {/* Title */}
        <Box display="flex" alignItems="center" mb={2}>
          {editingTitle && session.creatorId === user.userID ? (
            <TextField
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key==='Enter'&&saveTitle()}
              variant="standard"
              autoFocus
              sx={{ mr:1 }}
            />
          ) : (
            <Typography
              variant="h4"
              onClick={session.creatorId===user.userID?() => setEditingTitle(true):undefined}
              sx={{ cursor: session.creatorId===user.userID?'pointer':'default', flexGrow:1 }}
            >
              {title}
            </Typography>
          )}
          {session.creatorId===user.userID && !editingTitle && (
            <IconButton onClick={() => setEditingTitle(true)}><EditIcon/></IconButton>
          )}
        </Box>
        {/* Session Info */}
        <Typography variant="body2" sx={{ mb:1 }}>
          Session ID: <Typography component="span" sx={{ fontFamily:'monospace', textDecoration:'underline', cursor:'pointer' }} onClick={()=>navigator.clipboard.writeText(window.location.href)}>{sessionID}</Typography>
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {total} participant{total!==1?'s':''} joined{consensus!==null?` — Consensus: ${consensus}`:''}
        </Typography>
        {/* Participants */}
        <Typography variant="h6" gutterBottom>Participants</Typography>
        <Grid container spacing={2} sx={{ mb:2 }}>
          {unique.map(m => (
            <Grid key={m.userID} item xs={12} sm={6} md={4} lg={3}>
              <ParticipantCard
                participant={{ name: m.userName, voted: m.vote!=null, vote: m.vote }}
                revealed={session.showVote}
                editable={m.userID===user.userID}
                onUpdateName={newName => updateName(m.userID, newName)}
              />
            </Grid>
          ))}
        </Grid>
        {/* Voting Options */}
        {!session.showVote && (
          <>
            <Typography variant="h6" gutterBottom>Your Vote</Typography>
            <Grid container spacing={2} sx={{ mb:2 }}>
              {OPTIONS.map(n => (
                <Grid key={n} item xs={4} sm={2}>
                  <Tooltip title={LEGEND[n]} arrow>
                    <Box>
                      <VoteOptionCard
                        option={n}
                        selected={unique.find(u=>u.userID===user.userID)?.vote===n}
                        onClick={()=>castVote(n)}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {/* Controls */}
        <Box sx={{ display:'flex', gap:2 }}>
          <Button onClick={()=>showVotes(sessionID)} variant="contained">Show Votes</Button>
          <Button onClick={()=>clearVotes(sessionID)} variant="outlined">Clear Votes</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SessionPage;
