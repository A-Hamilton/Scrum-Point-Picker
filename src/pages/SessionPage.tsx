// src/pages/SessionPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Button from '../components/Button';
import Input from '../components/Input';
import VoteCard from '../components/VoteCard';
import ParticipantList from '../components/ParticipantList'; // Ensure the file exists at this path or adjust the path

const SessionPage: React.FC = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    sessions, addTicket, castVote, revealVotes,
    resetVotes, removeUser, deleteSession
  } = useSession();
  const session = sessionId ? sessions[sessionId] : undefined;
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  if (!session) {
    return <div className="text-center text-red-500">Session not found.</div>;
  }

  const isModerator = session.moderator === /*[placeholder for current user]*/ session.participants[0];
  const currentTicket = session.tickets[0]; // Voting on first ticket only for simplicity

  // Handle adding a new ticket (moderator only)
  const handleAddTicket = () => {
    if (!newTicketTitle.trim()) return;
    addTicket(session.id, newTicketTitle.trim());
    setNewTicketTitle('');
  };

  // Handle user casting a vote
  const handleVote = (value: number) => {
    if (!selectedValue) {
      setSelectedValue(value);
      castVote(session.id, currentTicket.id, session.participants[0], value);
    }
  };

  // Handle reveal votes (moderator only)
  const handleReveal = () => {
    revealVotes(session.id);
  };

  // Handle restart (clear votes) (moderator only)
  const handleReset = () => {
    resetVotes(session.id);
    setSelectedValue(null);
  };

  // Handle deleting session (moderator only)
  const handleDelete = () => {
    deleteSession(session.id);
    navigate('/');
  };

  return (
    <div>
      {/* Session Header */}
      <header className="mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold">{session.name}</h2>
        <p className="text-sm text-gray-600">Session ID: {session.id}</p>
      </header>

      {/* Session Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Participants and Controls */}
        <div className="md:w-1/3">
          <ParticipantList participants={session.participants} 
                           votes={currentTicket.votes} 
                           revealed={session.revealed} />
          {isModerator && (
            <div className="mt-4 space-y-2">
              <Input 
                label="New Ticket Title" 
                value={newTicketTitle} 
                onChange={e => setNewTicketTitle(e.target.value)}
                placeholder="Enter ticket/story title" 
              />
              <Button onClick={handleAddTicket} className="w-full">
                Add Ticket
              </Button>
              <Button onClick={handleReveal} className="w-full bg-yellow-500 hover:bg-yellow-600">
                Reveal Votes
              </Button>
              <Button onClick={handleReset} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Clear Votes
              </Button>
              <Button onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-700">
                End Session
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel: Voting Cards */}
        <div className="md:w-2/3">
          <h3 className="text-xl font-semibold mb-2">Current Ticket:</h3>
          <p className="mb-4 text-gray-700">{currentTicket?.title || 'No ticket added yet.'}</p>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            { [1, 2, 3, 5, 8, 13, 21, 34, 55].map(point => (
              <VoteCard 
                key={point}
                value={point}
                onClick={() => handleVote(point)}
                selected={selectedValue === point}
              />
            )) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
