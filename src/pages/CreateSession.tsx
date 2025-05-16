// src/pages/CreateSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { getOrCreateUserID } from '../utils/getOrCreateUserID';

const MAX_NAME_LENGTH = 20;

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [name, setName] = useState<string>(
    () => localStorage.getItem('userName') || ''
  );
  const [error, setError] = useState('');

  // stable per‐browser userID
  const userID = getOrCreateUserID();

  // we only need the socket when creating:
  const socket = io(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000'
      : `${window.location.protocol}//${window.location.host}`,
    { autoConnect: false, transports: ['websocket'] }
  );

  const handleCreate = () => {
    // 1) validation
    if (!title.trim()) {
      setError('Please enter a session title.');
      return;
    }
    const trimmedName = (name.trim() || 'Anonymous').slice(0, MAX_NAME_LENGTH);

    // 2) persist the name
    localStorage.setItem('userName', trimmedName);

    // 3) generate a session ID
    const sessionID = uuidv4();

    // 4) tell the server to create the session
    socket.connect();
    socket.emit('createSession', {
      sessionID,
      title: title.trim(),
      user: { userID, userName: trimmedName },
    });

    // 5) immediately navigate into it
    navigate(`/session/${sessionID}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Start a New Session
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Your Name"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= MAX_NAME_LENGTH) {
              setName(v);
              setError('');
            }
          }}
          helperText={`Max ${MAX_NAME_LENGTH} chars`}
          inputProps={{ maxLength: MAX_NAME_LENGTH }}
          fullWidth
        />
        <TextField
          label="Session Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          fullWidth
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button variant="contained" onClick={handleCreate}>
          Create Session
        </Button>
      </Box>
    </Container>
  );
};

export default CreateSessionPage;
