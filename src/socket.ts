// src/socket.ts
import { io, Socket } from 'socket.io-client';

// Dynamically compute your server URL
const { protocol, hostname } = window.location;
const SOCKET_PORT = 4000;
const SOCKET_URL  = `${protocol}//${hostname}:${SOCKET_PORT}`;

// Create the Socket.IO client (no auto-connect)
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

// Expose for debugging in the console:
//   const s = window.__socketTest__; s.connect(); …
declare global {
  interface Window {
    __socketTest__?: Socket;
  }
}
window.__socketTest__ = socket;
window.__socketTest__.connect = () => socket.connect();