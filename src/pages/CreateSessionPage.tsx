// src/pages/CreateSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateSessionPage: React.FC = () => {
  const [yourName, setYourName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const { createSession } = useSession();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!yourName.trim() || !sessionName.trim()) return;
    const sessionId = createSession(sessionName.trim(), yourName.trim());
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create New Session</h2>
      <Input 
        label="Your Name" 
        value={yourName} 
        onChange={e => setYourName(e.target.value)} 
        placeholder="Enter your name" 
      />
      <Input 
        label="Session Name" 
        value={sessionName} 
        onChange={e => setSessionName(e.target.value)} 
        placeholder="e.g. Sprint Planning" 
      />
      <Button onClick={handleCreate} className="mt-4 w-full">
        Create Session
      </Button>
    </div>
  );
};

export default CreateSessionPage;
