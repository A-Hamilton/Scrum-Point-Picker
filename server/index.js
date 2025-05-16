// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// In-memory store for sessions
const sessions = {};

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

/** Broadcast the full session object to everyone in the room */
function emitSession(sessionID) {
  const sess = sessions[sessionID];
  if (sess) {
    io.to(sessionID).emit(`fetchData-${sessionID}`, sess);
  }
}

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // Create a new planning poker room
  socket.on('createRoom', ({ user }) => {
    const sessionID = uuidv4();
    sessions[sessionID] = {
      id: sessionID,
      title: 'Planning Poker',
      creatorId: user.userID,
      members: [{ userID: user.userID, userName: user.userName.trim(), vote: null }],
      showVote: false,
    };
    socket.join(sessionID);

    // 1) Acknowledge back to creator so they can navigate
    socket.emit('sessionCreated', { sessionID });

    // 2) Send initial state
    emitSession(sessionID);
  });

  // Join an existing room
  socket.on('joinRoom', ({ sessionID, user }) => {
    const sess = sessions[sessionID];
    if (!sess) return;

    socket.join(sessionID);
    if (!sess.members.find(m => m.userID === user.userID)) {
      sess.members.push({ userID: user.userID, userName: user.userName.trim(), vote: null });
    }
    emitSession(sessionID);
  });

  // Update the session title
  socket.on('updateTitle', ({ sessionID, title }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.title = title.trim();
    io.to(sessionID).emit(`titleUpdated-${sessionID}`, { title: sess.title });
    emitSession(sessionID);
  });

  // Cast a vote
  socket.on('vote', ({ sessionID, userID, vote }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const mem = sess.members.find(m => m.userID === userID);
    if (mem) mem.vote = vote;
    io.to(sessionID).emit(`votesUpdated-${sessionID}`, sess.members);
  });

  // Reveal all votes
  socket.on('reveal', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = true;
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: true });
  });

  // ← UPDATED: Reset votes AND hide them again
  socket.on('reset', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;

    // 1) Clear every vote
    sess.members.forEach(m => (m.vote = null));

    // 2) Hide votes again
    sess.showVote = false;

    // 3) Notify clients to update reveal state
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: false });

    // 4) Broadcast the cleared session
    emitSession(sessionID);
  });

  // Rename a participant
  socket.on('updateUserName', ({ sessionID, userID, newName }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const mem = sess.members.find(m => m.userID === userID);
    if (mem && newName.trim()) mem.userName = newName.trim();
    io.to(sessionID).emit(`nameUpdated-${sessionID}`, { userID, newName: mem.userName });
    emitSession(sessionID);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
