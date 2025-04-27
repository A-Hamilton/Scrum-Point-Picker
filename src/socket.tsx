// src/socket.js
import { io } from 'socket.io-client';

// USE CRA PROXY:
export const socket = io({ autoConnect: false });