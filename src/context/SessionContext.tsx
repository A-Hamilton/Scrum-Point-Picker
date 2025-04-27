// src/context/SessionContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Ticket {
  id: string;
  title: string;
  votes: { [userName: string]: number | null };
}

interface Session {
  id: string;
  name: string;
  tickets: Ticket[];
  participants: string[];
  moderator: string;
  revealed: boolean;
}

interface SessionContextType {
  sessions: { [id: string]: Session };
  createSession: (name: string, moderator: string) => string;
  joinSession: (id: string, userName: string) => void;
  addTicket: (sessionId: string, title: string) => void;
  castVote: (sessionId: string, ticketId: string, userName: string, value: number) => void;
  revealVotes: (sessionId: string) => void;
  resetVotes: (sessionId: string) => void;
  removeUser: (sessionId: string, userName: string) => void;
  deleteSession: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [sessions, setSessions] = useState<{ [id: string]: Session }>({});

  const createSession = (name: string, moderator: string) => {
    const id = uuidv4().split('-')[0]; // short id
    const newSession: Session = {
      id,
      name,
      tickets: [],
      participants: [moderator],
      moderator,
      revealed: false,
    };
    setSessions(prev => ({ ...prev, [id]: newSession }));
    return id;
  };

  const joinSession = (id: string, userName: string) => {
    setSessions(prev => {
      const session = prev[id];
      if (session && !session.participants.includes(userName)) {
        const updated = { 
          ...session, 
          participants: [...session.participants, userName] 
        };
        // Initialize votes for existing tickets for this user
        updated.tickets = updated.tickets.map(ticket => ({
          ...ticket,
          votes: { ...ticket.votes, [userName]: null }
        }));
        return { ...prev, [id]: updated };
      }
      return prev;
    });
  };

  const addTicket = (sessionId: string, title: string) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      const newTicket: Ticket = {
        id: uuidv4().split('-')[0],
        title,
        votes: {},
      };
      // Set initial votes for all participants to null
      session.participants.forEach(u => { newTicket.votes[u] = null; });
      const updated = {
        ...session,
        tickets: [...session.tickets, newTicket],
        revealed: false,
      };
      return { ...prev, [sessionId]: updated };
    });
  };

  const castVote = (sessionId: string, ticketId: string, userName: string, value: number) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      const updatedTickets = session.tickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, votes: { ...ticket.votes, [userName]: value } }
          : ticket
      );
      const updated = { ...session, tickets: updatedTickets };
      return { ...prev, [sessionId]: updated };
    });
  };

  const revealVotes = (sessionId: string) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      return { ...prev, [sessionId]: { ...session, revealed: true } };
    });
  };

  const resetVotes = (sessionId: string) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      // Clear all votes back to null
      const resetTickets = session.tickets.map(ticket => {
        const clearedVotes: { [u: string]: null } = {};
        session.participants.forEach(u => (clearedVotes[u] = null));
        return { ...ticket, votes: clearedVotes };
      });
      return { ...prev, [sessionId]: { ...session, tickets: resetTickets, revealed: false } };
    });
  };

  const removeUser = (sessionId: string, userName: string) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      const remaining = session.participants.filter(u => u !== userName);
      const updatedTickets = session.tickets.map(ticket => {
        const { [userName]: _, ...restVotes } = ticket.votes;
        return { ...ticket, votes: restVotes as typeof ticket.votes };
      });
      return { ...prev, [sessionId]: { ...session, participants: remaining, tickets: updatedTickets } };
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
  };

  return (
    <SessionContext.Provider value={{
      sessions, createSession, joinSession, addTicket,
      castVote, revealVotes, resetVotes, removeUser, deleteSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};
