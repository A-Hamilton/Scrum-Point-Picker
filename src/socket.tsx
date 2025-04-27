import { io } from 'socket.io-client';
const { protocol, hostname } = window.location;                        // MDN Location API 
const SOCKET_URL = `${protocol}//${hostname}:4000`;
export const socket = io(SOCKET_URL, { autoConnect: false });
