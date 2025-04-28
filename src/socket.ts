import { io, Socket } from 'socket.io-client';

const URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : `${window.location.protocol}//${window.location.host}`;

export const socket: Socket = io(URL, {
  autoConnect: false,
  transports: ['websocket']
});
