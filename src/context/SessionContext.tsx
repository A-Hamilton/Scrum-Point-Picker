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

/** A single ticket within a session */
export interface Ticket {
  id: string;
  title: string;
  votes: Record<string, number | null>;
}

/** The overall session state */
export interface Session {
  id: string;
  name: string;
  moderator: string;
  participants: string[];
  tickets: Ticket[];
  revealed: boolean;
}

/** The context API exposed to your components */
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

/** Hook to consume the session context */
export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
};

/** Provider that wraps your app to supply session data and actions */
export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const socket = useSocket();

  // All sessions are stored in-memory on the server; we mirror them here.
  const [sessions, setSessions] = useState<Record<string, Session>>({});

  // Subscribe to server events once on mount
  useEffect(() => {
    // Initial list of all sessions
    socket.on('sessionList', (list: Record<string, Session>) => {
      setSessions(list);
    });
    // Updates for a single session
    socket.on('sessionUpdate', (updated: Session) => {
      setSessions((prev) => ({ ...prev, [updated.id]: updated }));
    });

    return () => {
      socket.off('sessionList');
      socket.off('sessionUpdate');
    };
  }, [socket]);

  /** Create a new session on the server */
  const createSession = (name: string, moderator: string): string => {
    const id = uuidv4();
    setSessions(prev => ({
      ...prev,
      [id]: { id, name, moderator, participants: [moderator], tickets: [], revealed: false }
    }));
  
    socket.emit('createSession', { id, name, moderator });
    return id;
  };
  

  /** Join an existing session room */
  const joinSession = (sessionId: string, userName: string): void => {
    socket.emit('joinSession', { id: sessionId, userName });
  };

  /** Add a new ticket to a session */
  const addTicket = (sessionId: string, title: string): void => {
    const ticket: Ticket = {
      id: uuidv4(),
      title,
      votes: {},
    };
    socket.emit('addTicket', { sessionId, ticket });
  };

  /** Remove a ticket from a session */
  const deleteTicket = (sessionId: string, ticketId: string): void => {
    socket.emit('deleteTicket', { sessionId, ticketId });
  };

  /** Cast or update your vote on a given ticket */
  const castVote = (
    sessionId: string,
    ticketId: string,
    userName: string,
    value: number
  ): void => {
    socket.emit('castVote', { sessionId, ticketId, userName, value });
  };

  /** Reveal all votes in the session */
  const revealVotes = (sessionId: string): void => {
    socket.emit('revealVotes', { sessionId });
  };

  /** Reset voting state (clear all votes) */
  const resetVotes = (sessionId: string): void => {
    socket.emit('resetVotes', { sessionId });
  };

  /** Remove a participant from the session */
  const removeUser = (sessionId: string, userName: string): void => {
    socket.emit('removeUser', { sessionId, userName });
  };

  /** Delete a session entirely */
  const deleteSession = (sessionId: string): void => {
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
