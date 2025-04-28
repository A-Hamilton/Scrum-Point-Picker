import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import getUser from '../utils/getUser';
import requestSession from '../utils/requestSession';
import joinSession from '../utils/joinSession';
import showVotes from '../utils/showVotes';
import clearVotes from '../utils/clearVotes';
import VoteCard from '../components/VoteCard';

interface Member {
  userID: string;
  userName: string;
  vote: number | null;
}
interface SessionData {
  id: string;
  members: Member[];
  showVote: boolean;
}

const SessionPage: React.FC = () => {
  const [sessionID, setSessionID] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    if (!sessionID) return;
    const evt = `fetchData-${sessionID}`;
    socket.on(evt, setSession);
    return () => { socket.off(evt); };
  }, [sessionID]);

  const handleCreate = async () => {
    const id = await requestSession();
    setSessionID(id);
    socket.emit('joinRoom', id);
  };

  const handleJoin = async () => {
    if (!sessionID.trim()) return alert('Enter session ID');
    await joinSession(sessionID);
    socket.emit('joinRoom', sessionID);
  };

  const castVote = (vote: number) => {
    socket.emit('vote', { sessionID, user: getUser(), vote });
  };

  if (!session) {
    return (
      <div>
        <button onClick={handleCreate}>Create Session</button>
        <input
          placeholder="Session ID"
          value={sessionID}
          onChange={e => setSessionID(e.target.value)}
        />
        <button onClick={handleJoin}>Join Session</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Session: {session.id}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {session.members.map(m => (
          <VoteCard
            key={m.userID}
            userName={m.userName}
            vote={session.showVote ? m.vote : null}
            onVote={castVote}
          />
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => showVotes(sessionID)}>Show Votes</button>
        <button onClick={() => clearVotes(sessionID)}>Clear Votes</button>
      </div>
    </div>
  );
};

export default SessionPage;
