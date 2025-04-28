// server/index.js

const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  transports: ['websocket'],
  cors: { origin: '*' }
});

// In-memory store of all sessions
// sessionID -> { id, title, creatorId, members, showVote }
const sessions = {};
// Map socket.id to session & user for cleanup
const socketSessionMap = {};
const socketUserMap = {};

// Broadcast the full session object to all in room
function emitSession(sessionID) {
  const sess = sessions[sessionID];
  if (sess) {
    io.to(sessionID).emit(`fetchData-${sessionID}`, sess);
  }
}

io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`);

  // Join or create room
  socket.on('joinRoom', ({ sessionID, user }) => {
    socket.join(sessionID);
    socketSessionMap[socket.id] = sessionID;
    socketUserMap[socket.id] = user.userID;

    // Initialize session if needed
    if (!sessions[sessionID]) {
      sessions[sessionID] = {
        id: sessionID,
        title: 'New Session',
        creatorId: user.userID,
        members: [],
        showVote: false
      };
    }

    const sess = sessions[sessionID];
    const name = user.userName && user.userName.trim();
    const existing = sess.members.find(m => m.userID === user.userID);
    if (existing) {
      if (name) existing.userName = user.userName;
    } else if (name) {
      sess.members.push({ userID: user.userID, userName: user.userName, vote: null });
    }

    emitSession(sessionID);
  });

  // Update session title
  socket.on('updateTitle', ({ sessionID, title }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.title = title;
    io.to(sessionID).emit(`titleUpdated-${sessionID}`, { title });
  });

  // Update own username (and add member if missing)
  socket.on('updateUserName', ({ sessionID, userID, newName }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    let member = sess.members.find(m => m.userID === userID);
    if (member) {
      if (newName && newName.trim()) member.userName = newName.trim();
    } else if (newName && newName.trim()) {
      member = { userID, userName: newName.trim(), vote: null };
      sess.members.push(member);
    }
    emitSession(sessionID);
  });

  // Voting
  socket.on('vote', ({ sessionID, user, vote }) => {
    const sess = sessions[sessionID];
    if (!sess) return;
    let member = sess.members.find(m => m.userID === user.userID);
    if (!member) {
      member = { userID: user.userID, userName: user.userName, vote };
      sess.members.push(member);
    } else {
      member.vote = vote;
    }
    emitSession(sessionID);
  });

  // Show votes
  socket.on('showVotes', sessionID => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = true;
    emitSession(sessionID);
  });

  // Clear votes
  socket.on('clearVotes', sessionID => {
    const sess = sessions[sessionID];
    if (!sess) return;
    sess.showVote = false;
    sess.members.forEach(m => (m.vote = null));
    emitSession(sessionID);
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const sessionID = socketSessionMap[socket.id];
    const userID = socketUserMap[socket.id];
    if (sessionID && sessions[sessionID]) {
      const sess = sessions[sessionID];
      sess.members = sess.members.filter(m => m.userID !== userID);
      if (sess.members.length === 0) {
        delete sessions[sessionID];
      } else {
        emitSession(sessionID);
      }
    }
    delete socketSessionMap[socket.id];
    delete socketUserMap[socket.id];
  });
});

// REST: create session with optional title
app.post('/createSession', (req, res) => {
  const { title: incomingTitle } = req.body;
  const sessionTitle = incomingTitle && incomingTitle.trim() ? incomingTitle.trim() : 'New Session';

  const sessionID = uuid();
  sessions[sessionID] = {
    id: sessionID,
    title: sessionTitle,
    creatorId: null,
    members: [],
    showVote: false
  };
  res.send(sessionID);
});

// REST: join session (emit only)
app.post('/joinSession', (req, res) => {
  const { sessionID } = req.body;
  if (!sessions[sessionID]) return res.status(404).send('Session not found');
  emitSession(sessionID);
  res.sendStatus(200);
});

// REST: show votes
app.post('/showVotes', (req, res) => {
  const { sessionID } = req.body;
  const sess = sessions[sessionID];
  if (!sess) return res.status(404).send('Session not found');
  sess.showVote = true;
  emitSession(sessionID);
  res.sendStatus(200);
});

// REST: clear votes
app.post('/clearVotes', (req, res) => {
  const { sessionID } = req.body;
  const sess = sessions[sessionID];
  if (!sess) return res.status(404).send('Session not found');
  sess.showVote = false;
  sess.members.forEach(m => (m.vote = null));
  emitSession(sessionID);
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));