// src/components/VoteOptionCard.tsx

import React from 'react';
import { Card, Typography, styled } from '@mui/material';

interface Props {
  option: number;
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const OptionCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'disabled',
})<Props>(({ theme, selected, disabled }) => ({
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.common.white : theme.palette.text.primary,
  border: `2px solid ${selected ? theme.palette.primary.dark : theme.palette.divider}`,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'transform 0.2s, background 0.3s',
  '&:hover': {
    transform: selected || disabled ? 'none' : 'scale(1.05)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.light}`,
  },
}));

const VoteOptionCard: React.FC<Props> = ({ option, selected, onClick, disabled, 'aria-label': ariaLabel }) => (
  <OptionCard
        selected={selected}
        onClick={disabled ? undefined : onClick}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        disabled={disabled} option={0}  >
    <Typography variant="h4">{option}</Typography>
  </OptionCard>
);

export default VoteOptionCard;