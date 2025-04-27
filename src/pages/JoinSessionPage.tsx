// src/pages/JoinSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Button from '../components/Button';
import Input from '../components/Input';

const JoinSessionPage: React.FC = () => {
  const [yourName, setYourName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { sessions, joinSession } = useSession();
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!yourName.trim() || !sessionId.trim()) return;
    if (!sessions[sessionId]) {
      alert('Session not found');
      return;
    }
    joinSession(sessionId.trim(), yourName.trim());
    navigate(`/session/${sessionId.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Join a Session</h2>
      <Input 
        label="Your Name" 
        value={yourName} 
        onChange={e => setYourName(e.target.value)} 
        placeholder="Enter your name" 
      />
      <Input 
        label="Session ID" 
        value={sessionId} 
        onChange={e => setSessionId(e.target.value)} 
        placeholder="Enter session ID" 
      />
      <Button onClick={handleJoin} className="mt-4 w-full bg-green-600 hover:bg-green-700">
        Join Session
      </Button>
    </div>
  );
};

export default JoinSessionPage;
