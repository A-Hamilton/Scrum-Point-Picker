// src/socket.js
import { io } from 'socket.io-client';

// No URL passed: defaults to window.location origin
export const socket = io({ autoConnect: false });
