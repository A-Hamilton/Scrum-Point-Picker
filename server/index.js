// server/index.js
const express = require('express');
const cors    = require('cors');
const app     = express();
app.use(cors());

const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const io         = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('createSession', ({ id, name, moderator }) => {
    // ...
  });

  socket.on('joinSession', ({ id, userName }) => {
    // ...
  });

  socket.on('addTicket', ({ sessionId, ticket }) => {
    // ...
  });

  // etc...
});

httpServer.listen(4000, () =>
  console.log('🚀 Socket.IO server running on http://localhost:4000')
);
