import React from 'react';

export interface VoteCardProps {
  userName: string;
  vote: number | null;
  onVote: (vote: number) => void;
}

const options = [1, 2, 3, 5, 8, 13, 21];

const VoteCard: React.FC<VoteCardProps> = ({ userName, vote, onVote }) => (
  <div
    style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 16,
      width: 120,
      textAlign: 'center'
    }}
  >
    <strong>{userName}</strong>
    <div style={{ margin: '12px 0', fontSize: 24 }}>
      {vote !== null ? vote : '❓'}
    </div>
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        justifyContent: 'center'
      }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onVote(opt)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            border: vote === opt ? '2px solid #007bff' : '1px solid #aaa',
            background: vote === opt ? '#e7f1ff' : '#fff',
            cursor: 'pointer'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default VoteCard;
