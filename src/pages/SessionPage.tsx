// src/pages/SessionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';      // adjust path if your socket client is elsewhere
import ParticipantCard from '../components/ParticipantCard';
import { Grid, Typography, Button, TextField } from '@mui/material';

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
  const { id: routeID } = useParams<{ id: string }>();
  const [sessionID, setSessionID] = useState<string>(routeID || '');
  const [session, setSession]       = useState<SessionData | null>(null);
  const [title, setTitle]           = useState<string>('');
  const [isEditingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Join or create the session on mount
  useEffect(() => {
    if (!routeID) return;
    socket.emit('joinRoom', { sessionID: routeID, user: { userID: 'me' } });
    setSessionID(routeID);
  }, [routeID]);

  // Wire up socket listeners
  useEffect(() => {
    if (!sessionID) return;
    const dataEvt  = `fetchData-${sessionID}`;
    const titleEvt = `titleUpdated-${sessionID}`;
    const nameEvt  = `nameUpdated-${sessionID}`;

    const handleData = (data: SessionData) => {
      setSession(data);
      setTitle(data.title);
      setTitleInput(data.title);
    };
    const handleTitle = ({ title: newT }: { title: string }) => {
      setTitle(newT);
      setTitleInput(newT);
    };
    const handleName = ({ userID, newName }: { userID: string; newName: string }) => {
      setSession(prev =>
        prev && {
          ...prev,
          members: prev.members.map(m =>
            m.userID === userID ? { ...m, userName: newName } : m
          )
        }
      );
    };

    socket.on(dataEvt,  handleData);
    socket.on(titleEvt, handleTitle);
    socket.on(nameEvt,  handleName);
    return () => {
      socket.off(dataEvt,  handleData);
      socket.off(titleEvt, handleTitle);
      socket.off(nameEvt,  handleName);
    };
  }, [sessionID]);

  // Emit a name update
  const updateName = (userID: string, newName: string) =>
    socket.emit('updateUserName', { sessionID, userID, newName });

  // Emit a title update
  const saveTitle = () => {
    socket.emit('updateTitle', { sessionID, title: titleInput.trim() });
    setEditingTitle(false);
  };

  return (
    <div>
      <header style={{ marginBottom: 16 }}>
        {isEditingTitle ? (
          <TextField
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => e.key === 'Enter' && saveTitle()}
            variant="outlined"
            size="small"
            autoFocus
          />
        ) : (
          <Typography variant="h4" onClick={() => setEditingTitle(true)}>
            {title}
          </Typography>
        )}
      </header>

      <Grid container spacing={2}>
        {session?.members.map(m => (
          <Grid key={m.userID} item xs={12} sm={6} md={4}>
            <ParticipantCard
              participant={{
                name: m.userName,
                voted: m.vote != null,
                vote: m.vote,
              }}
              revealed={session.showVote}
              editable={m.userID === 'me'}  // replace 'me' with your userID logic
              onUpdateName={newName => updateName(m.userID, newName)}
            />
          </Grid>
        ))}
      </Grid>

      {/* … other UI: point cards, reveal/reset buttons … */}
    </div>
  );
};

export default SessionPage;
