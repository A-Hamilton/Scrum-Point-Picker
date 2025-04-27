// src/components/VoteCard.tsx
import React from 'react';

type VoteCardProps = {
  value: number;
  selected: boolean;
  onClick: () => void;
};

const VoteCard: React.FC<VoteCardProps> = ({ value, selected, onClick }) => (
  <button
    onClick={onClick}
    className={
      `p-4 border rounded-lg text-xl font-semibold focus:outline-none ` +
      (selected
        ? 'bg-green-400 border-green-500 text-white'
        : 'bg-white border-gray-300 hover:bg-gray-100')
    }
    aria-pressed={selected}
  >
    {value}
  </button>
);

export default VoteCard;
