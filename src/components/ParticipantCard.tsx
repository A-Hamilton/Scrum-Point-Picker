// src/components/ParticipantCard.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Avatar,
  Typography,
  IconButton,
  TextField,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export interface Participant {
  name: string;
  voted: boolean;
  vote: number | null;
}

export interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
  editable?: boolean;
  onUpdateName?: (newName: string) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  revealed,
  editable = false,
  onUpdateName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(participant.name);

  // Sync input when participant.name updates externally
  useEffect(() => {
    if (!isEditing) setNameInput(participant.name);
  }, [participant.name, isEditing]);

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed && onUpdateName) {
      onUpdateName(trimmed);
    }
    setIsEditing(false);
  };

  return (
    <Card elevation={3} sx={{ position: 'relative' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {participant.name.charAt(0).toUpperCase()}
          </Avatar>
        }
        action={
          editable && !isEditing ? (
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : null
        }
        title={
          isEditing ? (
            <TextField
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              size="small"
              autoFocus
            />
          ) : (
            <Typography variant="subtitle1">
              {participant.name}
            </Typography>
          )
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {participant.voted
            ? (revealed ? `Voted: ${participant.vote}` : 'Voted')
            : 'Awaiting vote...'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ParticipantCard;
