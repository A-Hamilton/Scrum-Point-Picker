import React from 'react';
import { Card, Typography } from '@mui/material';

interface VoteOptionCardProps {
  option: number;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

const VoteOptionCard: React.FC<VoteOptionCardProps> = ({
  option,
  selected,
  onClick,
  disabled,
}) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        width: 80,
        height: 120,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'transform 0.1s, box-shadow 0.2s',
        backgroundColor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        boxShadow: selected
          ? (theme) => theme.shadows[6]
          : (theme) => theme.shadows[2],
        '&:hover': disabled
          ? {}
          : {
              transform: 'scale(1.08)',
              boxShadow: (theme) => theme.shadows[8],
            },
      }}
      elevation={selected ? 6 : 2}
    >
      <Typography variant="h5">{option}</Typography>
    </Card>
  );
};

export default VoteOptionCard;
