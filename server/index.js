// server/index.js
const express = require('express');
const cors    = require('cors');
const app     = express();
app.use(cors());

// 1) Create HTTP server and attach Socket.IO
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const io         = new Server(httpServer, { cors: { origin: '*' } });

const sessions = {};  // in-memory sessions map

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // CREATE SESSION
  socket.on('createSession', ({ id, name, moderator }) => {
    // Build the session object
    const session = {
      id,
      name,
      moderator,
      participants: [moderator],
      tickets: [],
      revealed: false
    };
    sessions[id] = session;

    // 1️⃣ Have the creator join the room immediately :contentReference[oaicite:0]{index=0}
    socket.join(id);

    // Broadcast updated session list to all
    io.emit('sessionList', sessions);

    // Also notify those already in the room (creator only so far)
    io.to(id).emit('sessionUpdate', session);
  });

  // JOIN SESSION
  socket.on('joinSession', ({ id, userName }) => {
    const session = sessions[id];
    if (!session) return;
    session.participants.push(userName);

    // 2️⃣ Join the room on a genuine join :contentReference[oaicite:1]{index=1}
    socket.join(id);

    // Broadcast update
    io.emit('sessionList', sessions);
    io.to(id).emit('sessionUpdate', session);
  });

  // ADD TICKET
  socket.on('addTicket', ({ sessionId, ticket }) => {
    const session = sessions[sessionId];
    if (!session) return;
    session.tickets.push(ticket);

    // Broadcast only to the session's room :contentReference[oaicite:2]{index=2}
    io.to(sessionId).emit('sessionUpdate', session);
  });

  // (…other handlers identical, always io.to(sessionId).emit…)
});

// 3) Listen on port 4000 so both HTTP and WS are on the same server
const PORT = 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`)
);
