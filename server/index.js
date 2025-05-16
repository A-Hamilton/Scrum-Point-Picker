// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Import shared sessions store and REST router
const sessions = require('./sessionsStore');
const sessionRoutes = require('./routes/sessions');

const app = express();
app.use(cors());
app.use(express.json());

// Mount REST API at /sessions
app.use('/sessions', sessionRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Broadcast full session state to clients
function emitSession(sessionID) {
  const sess = sessions[sessionID];
  if (sess) io.to(sessionID).emit(`fetchData-${sessionID}`, sess);
}

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // Create a session
  socket.on('createRoom', ({ user }) => {
    const sessionID = uuidv4();
    sessions[sessionID] = {
      id: sessionID,
      title: 'Planning Poker',
      creatorId: user.userID,
      members: [],
      showVote: false,
    };
    socket.join(sessionID);
    sessions[sessionID].members.push({
      userID: user.userID,
      userName: user.userName.trim(),
      vote: null,
    });
    emitSession(sessionID);
  });

  // Join existing session
  socket.on('joinRoom', ({ sessionID, user }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    socket.join(sessionID);
    if (!sess.members.some(m => m.userID === user.userID)) {
      sess.members.push({ userID: user.userID, userName: user.userName.trim(), vote: null });
    }
    emitSession(sessionID);
  });

  // Update session title
  socket.on('updateTitle', ({ sessionID, title }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.title = title.trim();
    io.to(sessionID).emit(`titleUpdated-${sessionID}`, { title: sess.title });
  });

  // Cast or change vote
  socket.on('vote', ({ sessionID, userID, vote }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    let member = sess.members.find(m => m.userID === userID);
    if (member) member.vote = vote;
    else sess.members.push({ userID, userName: 'Anonymous', vote });
    io.to(sessionID).emit(`votesUpdated-${sessionID}`, sess.members);
  });

  // Reveal votes
  socket.on('reveal', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = true;
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: true });
  });

  // Reset votes
  socket.on('reset', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.members.forEach(m => (m.vote = null));
    sess.showVote = false;
    emitSession(sessionID);
  });

  // Update participant name
  socket.on('updateUserName', ({ sessionID, userID, newName }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const member = sess.members.find(m => m.userID === userID);
    if (member && newName.trim()) member.userName = newName.trim();
    io.to(sessionID).emit(`nameUpdated-${sessionID}`, { userID, newName: member?.userName || '' });
    emitSession(sessionID);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));