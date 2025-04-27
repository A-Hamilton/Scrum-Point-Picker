import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  joinSession: (id: string, userName: string) => void;
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
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<Record<string, Session>>(() => {
    const stored = localStorage.getItem('sessions');
    return stored ? JSON.parse(stored) : {};
  });

  // persist on every change
  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createSession = (name: string, moderator: string) => {
    const id = uuidv4();
    const session: Session = {
      id,
      name,
      moderator,
      participants: [moderator],
      tickets: [],
      revealed: false,
    };
    setSessions((s) => ({ ...s, [id]: session }));
    return id;
  };

  const joinSession = (id: string, userName: string) => {
    setSessions((s) => {
      const session = s[id];
      if (!session) return s;
      if (session.participants.includes(userName)) return s;
      // add user and init votes on existing tickets
      const updated: Session = {
        ...session,
        participants: [...session.participants, userName],
        tickets: session.tickets.map((t) => ({
          ...t,
          votes: { ...t.votes, [userName]: null },
        })),
      };
      return { ...s, [id]: updated };
    });
  };

  const addTicket = (sessionId: string, title: string) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      const ticket: Ticket = {
        id: uuidv4(),
        title,
        votes: session.participants.reduce(
          (acc, u) => ({ ...acc, [u]: null }),
          {}
        ),
      };
      const updated: Session = {
        ...session,
        tickets: [...session.tickets, ticket],
        revealed: false,
      };
      return { ...s, [sessionId]: updated };
    });
  };

  const deleteTicket = (sessionId: string, ticketId: string) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      const updated: Session = {
        ...session,
        tickets: session.tickets.filter((t) => t.id !== ticketId),
      };
      return { ...s, [sessionId]: updated };
    });
  };

  const castVote = (
    sessionId: string,
    ticketId: string,
    userName: string,
    value: number
  ) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      const updatedTickets = session.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, votes: { ...t.votes, [userName]: value } }
          : t
      );
      return { ...s, [sessionId]: { ...session, tickets: updatedTickets } };
    });
  };

  const revealVotes = (sessionId: string) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      return { ...s, [sessionId]: { ...session, revealed: true } };
    });
  };

  const resetVotes = (sessionId: string) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      const cleared = session.tickets.map((t) => ({
        ...t,
        votes: Object.keys(t.votes).reduce(
          (acc, u) => ({ ...acc, [u]: null }),
          {}
        ),
      }));
      return {
        ...s,
        [sessionId]: { ...session, tickets: cleared, revealed: false },
      };
    });
  };

  const removeUser = (sessionId: string, userName: string) => {
    setSessions((s) => {
      const session = s[sessionId];
      if (!session) return s;
      const remaining = session.participants.filter((u) => u !== userName);
      const updatedTickets = session.tickets.map((t) => {
        const { [userName]: _, ...rest } = t.votes;
        return { ...t, votes: rest as Record<string, number | null> };
      });
      return {
        ...s,
        [sessionId]: { ...session, participants: remaining, tickets: updatedTickets },
      };
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions((s) => {
      const copy = { ...s };
      delete copy[sessionId];
      return copy;
    });
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
