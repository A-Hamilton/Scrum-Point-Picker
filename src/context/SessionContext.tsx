// src/context/SessionContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from './SocketContext';

export interface Ticket {
  id: string;
  title: string;
  votes: Record<string, number | null>;
}

export interface Session {
  id: string;
  name: string;
  moderator: string;
  participants: string[];
  tickets: Ticket[];
  revealed: boolean;
}

export interface SessionContextType {
  sessions: Record<string, Session>;
  createSession: (name: string, moderator: string) => string;
  joinSession: (sessionId: string, userName: string) => void;
  addTicket: (sessionId: string, title: string) => void;
  deleteTicket: (sessionId: string, ticketId: string) => void;
  castVote: (
    sessionId: string,
    ticketId: string,
    userName: string,
    value: number
  ) => void;
  revealVotes: (sessionId: string) => void;
  resetVotes: (sessionId: string) => void;
  removeUser: (sessionId: string, userName: string) => void;
  deleteSession: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const socket = useSocket();
  const [sessions, setSessions] = useState<Record<string, Session>>({});

  // Listen for session list and updates
  useEffect(() => {
    socket.on('sessionList', (list: Record<string, Session>) => {
      setSessions(list);
    });
    socket.on('sessionUpdate', (updated: Session) => {
      setSessions((prev) => ({ ...prev, [updated.id]: updated }));
    });
    return () => {
      socket.off('sessionList');
      socket.off('sessionUpdate');
    };
  }, [socket]);

  const createSession = (name: string, moderator: string): string => {
    const id = uuidv4();
    // Optimistic insert so SessionPage sees it immediately
    setSessions((prev) => ({
      ...prev,
      [id]: { id, name, moderator, participants: [moderator], tickets: [], revealed: false },
    }));
    socket.emit('createSession', { id, name, moderator });
    return id;
  };

  const joinSession = (sessionId: string, userName: string) => {
    socket.emit('joinSession', { id: sessionId, userName });
  };

  const addTicket = (sessionId: string, title: string) => {
    const ticket: Ticket = { id: uuidv4(), title, votes: {} };
    socket.emit('addTicket', { sessionId, ticket });
  };

  const deleteTicket = (sessionId: string, ticketId: string) => {
    socket.emit('deleteTicket', { sessionId, ticketId });
  };

  const castVote = (
    sessionId: string,
    ticketId: string,
    userName: string,
    value: number
  ) => {
    socket.emit('castVote', { sessionId, ticketId, userName, value });
  };

  const revealVotes = (sessionId: string) => {
    socket.emit('revealVotes', { sessionId });
  };

  const resetVotes = (sessionId: string) => {
    socket.emit('resetVotes', { sessionId });
  };

  const removeUser = (sessionId: string, userName: string) => {
    socket.emit('removeUser', { sessionId, userName });
  };

  const deleteSession = (sessionId: string) => {
    socket.emit('deleteSession', { sessionId });
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        createSession,
        joinSession,
        addTicket,
        deleteTicket,
        castVote,
        revealVotes,
        resetVotes,
        removeUser,
        deleteSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
