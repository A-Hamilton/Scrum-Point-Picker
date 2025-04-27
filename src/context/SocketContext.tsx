// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { socket } from '../socket'; // Adjust the import path as necessary

const SocketContext = createContext(socket);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    socket.connect();              // Establish connection once on mount :contentReference[oaicite:10]{index=10}
    return () => { socket.disconnect(); };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
