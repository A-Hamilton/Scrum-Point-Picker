import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export interface Participant {
  name: string;
  voted: boolean;
  vote: number | null;
}

interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  revealed,
}) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6">{participant.name}</Typography>
      {participant.voted ? (
        revealed ? (
          <Typography variant="h4">{participant.vote}</Typography>
        ) : (
          <Typography>Voted</Typography>
        )
      ) : (
        <Typography color="text.secondary">Awaiting vote…</Typography>
      )}
    </CardContent>
  </Card>
);

export default ParticipantCard;
