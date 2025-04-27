import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Participant {
  name: string;
  voted: boolean;
  vote?: string | number;
}

interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
}

export default function ParticipantCard({ participant, revealed }: ParticipantCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{participant.name}</Typography>
        <Box sx={{ mt: 1 }}>
          {participant.voted ? (
            revealed ? (
              <Typography variant="h5">{participant.vote}</Typography>
            ) : (
              <Typography>Voted</Typography>
            )
          ) : (
            <Typography color="text.secondary">Awaiting vote...</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
