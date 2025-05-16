// src/components/ParticipantCard.tsx

import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export interface Participant {
  userID: string;
  userName: string;
  vote: number | null;
}

interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
  editable: boolean;
  onUpdateName: (newName: string) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  revealed,
  editable,
  onUpdateName,
}) => {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(participant.userName);

  const handleSave = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== participant.userName) {
      onUpdateName(trimmed);
    }
    setEditing(false);
  };

  return (
    <Card
      sx={{
        p: 2,
        position: 'relative',
        minWidth: 200,
        maxWidth: 240,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 160,
      }}
      elevation={3}
    >
      {/* Top row: Avatar, Name or TextField, Edit button */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ mr: 1 }}>
          {participant.userName.charAt(0).toUpperCase() || 'U'}
        </Avatar>

        {editing ? (
          <TextField
            variant="standard"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            fullWidth
            sx={{ mr: 1 }}
          />
        ) : (
          <Typography
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {participant.userName}
          </Typography>
        )}

        {editable && !editing && (
          <IconButton
            size="small"
            onClick={() => {
              setTempName(participant.userName);
              setEditing(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Middle: Vote number or awaiting text */}
      <Box
        sx={{
          mt: 2,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {revealed ? (
          <Typography variant="h4">{participant.vote}</Typography>
        ) : (
          <Typography color="text.secondary">Awaiting vote…</Typography>
        )}
      </Box>

      {/* Red dot if not yet voted */}
      {!revealed && participant.vote === null && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 10,
            height: 10,
            bgcolor: 'error.main',
            borderRadius: '50%',
          }}
        />
      )}
    </Card>
  );
};

export default ParticipantCard;
