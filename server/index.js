// server/index.js
const express = require('express');
const http = require('http').createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());  // Allow React dev server :contentReference[oaicite:6]{index=6}

const server = http.createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

// In-memory sessions store
const sessions = {};

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Create session
  socket.on('createSession', ({ id, name, moderator }) => {
    sessions[id] = { id, name, moderator, participants: [moderator], tickets: [], revealed: false };
    io.emit('sessionList', sessions);
  });

  // Join session and join room
  socket.on('joinSession', ({ id, userName }) => {
    const session = sessions[id];
    if (session && !session.participants.includes(userName)) {
      session.participants.push(userName);
      session.tickets.forEach(t => { t.votes[userName] = null; });
      io.to(id).emit('sessionUpdate', session);
    }
    socket.join(id);
  });

  // Add new ticket
  socket.on('addTicket', ({ sessionId, ticket }) => {
    const session = sessions[sessionId];
    if (session) {
      session.tickets.push(ticket);
      session.revealed = false;
      io.to(sessionId).emit('sessionUpdate', session);
    }
  });

  // Cast vote
  socket.on('castVote', ({ sessionId, ticketId, userName, value }) => {
    const session = sessions[sessionId];
    if (session) {
      const t = session.tickets.find(t => t.id === ticketId);
      if (t) t.votes[userName] = value;
      io.to(sessionId).emit('sessionUpdate', session);
    }
  });

  // Reveal votes
  socket.on('revealVotes', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session) {
      session.revealed = true;
      io.to(sessionId).emit('sessionUpdate', session);
    }
  });

  // Reset votes
  socket.on('resetVotes', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session) {
      session.revealed = false;
      session.tickets.forEach(t => {
        Object.keys(t.votes).forEach(u => { t.votes[u] = null; });
      });
      io.to(sessionId).emit('sessionUpdate', session);
    }
  });
});

http.listen(4000, () => console.log('🚀 Socket.IO server on http://localhost:4000'));