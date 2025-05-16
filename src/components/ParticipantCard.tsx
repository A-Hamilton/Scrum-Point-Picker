import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export interface Participant {
  name: string;
  voted: boolean;
  vote: number | null;
}
interface Props {
  participant: Participant;
  revealed: boolean;
  editable: boolean;
  onUpdateName: (newName: string) => void;
}

const MAX_NAME_LENGTH = 20;

const ParticipantCard: React.FC<Props> = ({
  participant,
  revealed,
  editable,
  onUpdateName,
}) => {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(participant.name);

  useEffect(() => {
    setNameInput(participant.name);
  }, [participant.name]);

  const save = () => {
    const trimmed = nameInput.trim().slice(0, MAX_NAME_LENGTH) || 'Anonymous';
    onUpdateName(trimmed);
    setEditing(false);
  };

  return (
    <Card
      elevation={2}
      sx={{
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardHeader
        avatar={
          <Avatar>
            {participant.name.charAt(0).toUpperCase() || '?'}
          </Avatar>
        }
        action={
          editable && !editing && (
            <IconButton
              size="small"
              onClick={() => setEditing(true)}
              aria-label="edit name"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )
        }
        title={
          editing ? (
            <TextField
              value={nameInput}
              onChange={(e) => {
                if (e.target.value.length <= MAX_NAME_LENGTH)
                  setNameInput(e.target.value);
              }}
              onBlur={save}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              size="small"
              fullWidth
              inputProps={{ maxLength: MAX_NAME_LENGTH }}
              helperText={`${nameInput.length}/${MAX_NAME_LENGTH}`}
            />
          ) : (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {participant.name}
            </Typography>
          )
        }
      />

      <CardContent>
        {revealed ? (
          <Box textAlign="center">
            <Typography variant="h4">
              {participant.voted ? participant.vote : '–'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {participant.voted ? 'Voted' : 'Awaiting vote...'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantCard;
