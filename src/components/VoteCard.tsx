import React from 'react';
import { Card, Typography, styled } from '@mui/material';

interface VoteCardProps {
  voted: boolean;
  vote?: number | null;
  onClick?: (vote: number) => void;
}

// Fibonacci-like choices
const OPTIONS = [1, 2, 3, 5, 8, 13, 21] as const;

const StyledVoteCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'voted',
})<{ voted: boolean }>(({ theme, voted }) => ({
  width: '100%',
  height: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: voted ? 'default' : 'pointer',
  backgroundColor: voted ? theme.palette.primary.main : theme.palette.grey[200],
  color: voted ? theme.palette.common.white : theme.palette.text.primary,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s ease, background-color 0.3s ease',
  '&:hover': {
    transform: voted ? 'none' : 'scale(1.05)',
  },
}));

const VoteCard: React.FC<VoteCardProps> = ({ voted, vote, onClick }) => {
  // If user hasn't voted, cycle through options on click
  const handleClick = () => {
    if (!voted && onClick) {
      // For simplicity choose the next option (or first)
      const next = OPTIONS[(vote != null && OPTIONS.includes(vote as typeof OPTIONS[number]) 
        ? OPTIONS.indexOf(vote as typeof OPTIONS[number]) + 1 
        : 0) % OPTIONS.length];
      onClick(next);
    }
  };

  return (
    <StyledVoteCard voted={voted} onClick={handleClick}>
      <Typography variant="h2">
        {voted ? vote : '?'}
      </Typography>
    </StyledVoteCard>
  );
};

export default VoteCard;
