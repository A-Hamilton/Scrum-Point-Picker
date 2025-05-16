// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const sessions = {};  // in-memory session store

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// broadcast full session state
function emitSession(sessionID) {
  const sess = sessions[sessionID];
  if (sess) {
    io.to(sessionID).emit(`fetchData-${sessionID}`, sess);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a session
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

    // remember for disconnect cleanup:
    socket.data.sessionID = sessionID;
    socket.data.userID = user.userID;

    // ack + initial state
    socket.emit('sessionCreated', { sessionID });
    emitSession(sessionID);
  });

  // Join existing
  socket.on('joinRoom', ({ sessionID, user }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    socket.join(sessionID);

    socket.data.sessionID = sessionID;
    socket.data.userID = user.userID;

    if (!sess.members.find(m => m.userID === user.userID)) {
      sess.members.push({ userID: user.userID, userName: user.userName.trim(), vote: null });
    }
    emitSession(sessionID);
  });

  // Delete the session entirely
  socket.on('deleteSession', ({ sessionID }) => {
    if (!sessions[sessionID]) return;
    // notify all in room
    io.to(sessionID).emit('sessionDeleted', { sessionID });
    // kick everyone out
    const room = io.sockets.adapter.rooms.get(sessionID);
    if (room) {
      for (const sockId of room) {
        const s = io.sockets.sockets.get(sockId);
        if (s) s.leave(sessionID);
      }
    }
    delete sessions[sessionID];
  });

  // Reset votes + hide again
  socket.on('reset', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.members.forEach(m => (m.vote = null));
    sess.showVote = false;
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: false });
    emitSession(sessionID);
  });

  // Reveal
  socket.on('reveal', ({ sessionID }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = true;
    io.to(sessionID).emit(`revealUpdated-${sessionID}`, { showVote: true });
  });

  // Vote
  socket.on('vote', ({ sessionID, userID, vote }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const mem = sess.members.find(m => m.userID === userID);
    if (mem) mem.vote = vote;
    io.to(sessionID).emit(`votesUpdated-${sessionID}`, sess.members);
  });

  // Update title
  socket.on('updateTitle', ({ sessionID, title }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.title = title.trim();
    io.to(sessionID).emit(`titleUpdated-${sessionID}`, { title: sess.title });
    emitSession(sessionID);
  });

  // Rename
  socket.on('updateUserName', ({ sessionID, userID, newName }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    const mem = sess.members.find(m => m.userID === userID);
    if (mem && newName.trim()) mem.userName = newName.trim();
    io.to(sessionID).emit(`nameUpdated-${sessionID}`, { userID, newName: mem.userName });
    emitSession(sessionID);
  });

  // Clean up on disconnect
  socket.on('disconnecting', () => {
    const { sessionID, userID } = socket.data;
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.members = sess.members.filter(m => m.userID !== userID);
    io.to(sessionID).emit(`votesUpdated-${sessionID}`, sess.members);
    if (sess.members.length === 0) {
      delete sessions[sessionID];
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
