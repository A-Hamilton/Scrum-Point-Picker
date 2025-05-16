// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const sessions = require('./sessionsStore');
const sessionRoutes = require('./routes/sessions');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/sessions', sessionRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

/** Helper to broadcast the full session to a room */
function emitSession(sessionID) {
  const sess = sessions[sessionID];
  if (sess) io.to(sessionID).emit(`fetchData-${sessionID}`, sess);
}

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // 1) Create a new session
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

    // ← ADD: let the creator know the new sessionID
    socket.emit('sessionCreated', { sessionID });

    // ← ADD: send them the initial data immediately
    emitSession(sessionID);
  });

  // 2) Join an existing room
  socket.on('joinRoom', ({ sessionID, user }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    socket.join(sessionID);
    if (!sess.members.some(m => m.userID === user.userID)) {
      sess.members.push({
        userID: user.userID,
        userName: user.userName.trim(),
        vote: null,
      });
    }
    emitSession(sessionID);
  });

  // 3) Title updates
  socket.on('updateTitle', ({ sessionID, title }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.title = title.trim();
    io.to(sessionID).emit(`titleUpdated-${sessionID}`, { title: sess.title });
    emitSession(sessionID);
  });

  // 4) Votes
  socket.on('vote', ({ sessionID, userID, vote }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const member = sess.members.find(m => m.userID === userID);
    if (member) member.vote = vote;
    io.to(sessionID).emit(`votesUpdated-${sessionID}`, sess.members);
  });

  // 5) Reveal
  socket.on('reveal', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = true;
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: true });
  });

  // 6) Reset
  socket.on('reset', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.members.forEach(m => (m.vote = null));
    emitSession(sessionID);
  });

  // 7) Rename
  socket.on('updateUserName', ({ sessionID, userID, newName }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const member = sess.members.find(m => m.userID === userID);
    if (member && newName.trim()) member.userName = newName.trim();
    io.to(sessionID).emit(`nameUpdated-${sessionID}`, {
      userID,
      newName: member.userName,
    });
    emitSession(sessionID);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
