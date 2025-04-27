// src/App.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import SessionPage from './pages/SessionPage';
import { SessionProvider } from './context/SessionContext';

const App: React.FC = () => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Header */}
        <header className="bg-blue-600 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              <Link to="/">Agile Ticket Voter</Link>
            </h1>
            <div className="space-x-4">
              <Link to="/create" className="hover:underline">Create Session</Link>
              <Link to="/join" className="hover:underline">Join Session</Link>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateSessionPage />} />
            <Route path="/join" element={<JoinSessionPage />} />
            <Route path="/session/:id" element={<SessionPage />} />
          </Routes>
        </main>
      </div>
    </SessionProvider>
  );
};

export default App;
