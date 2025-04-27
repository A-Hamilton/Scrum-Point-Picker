// src/components/ParticipantList.tsx
import React from 'react';

type ParticipantListProps = {
  participants: string[];
  votes: { [userName: string]: number | null };
  revealed: boolean;
};

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, votes, revealed }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">Participants</h3>
    <ul className="space-y-1">
      {participants.map(user => (
        <li key={user} className="flex justify-between items-center">
          <span>{user}</span>
          {revealed ? (
            <span className="font-bold">{votes[user] ?? '-'}</span>
          ) : (
            <span>
              {votes[user] != null
                ? <span role="img" aria-label="Voted">✔️</span>
                : <span role="img" aria-label="Waiting to vote">⏳</span>}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default ParticipantList;
