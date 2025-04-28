// server/index.js
const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(httpServer, {
  transports: ['websocket'],
  cors: { origin: '*' }
});

// In-memory store of all sessions
const sessions = {};        // { [sessionID]: { id, members: [], showVote } }
// Track which session & user each socket belongs to
const socketSessionMap = {}; // { [socket.id]: sessionID }
const socketUserMap    = {}; // { [socket.id]: userID }

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // Join room *and* register this user for cleanup later
  socket.on('joinRoom', ({ sessionID, user }) => {
    socket.join(sessionID);
    socketSessionMap[socket.id] = sessionID;
    socketUserMap[socket.id]    = user.userID;

    // If session exists, add the user if not already in it
    const s = sessions[sessionID];
    if (s) {
      if (!s.members.some(m => m.userID === user.userID)) {
        s.members.push({ userID: user.userID, userName: user.userName, vote: null });
      }
      io.to(sessionID).emit(`fetchData-${sessionID}`, s);
    }
  });

  // Voting logic remains unchanged
  socket.on('vote', ({ sessionID, user, vote }) => {
    const s = sessions[sessionID];
    if (!s) return;
    let m = s.members.find(m => m.userID === user.userID);
    if (!m) {
      m = { userID: user.userID, userName: user.userName, vote: null };
      s.members.push(m);
    }
    m.vote = vote;
    io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  });

  // **Cleanup** on disconnect
  socket.on('disconnect', () => {
    const sessionID = socketSessionMap[socket.id];
    const userID    = socketUserMap[socket.id];
    if (sessionID && sessions[sessionID]) {
      const s = sessions[sessionID];
      // remove the leaving user
      s.members = s.members.filter(m => m.userID !== userID);

      if (s.members.length === 0) {
        // if no one left, destroy the session entirely
        delete sessions[sessionID];
      } else {
        // otherwise broadcast the updated session
        io.to(sessionID).emit(`fetchData-${sessionID}`, s);
      }
    }
    delete socketSessionMap[socket.id];
    delete socketUserMap[socket.id];
  });
});

// REST endpoint to create a new session
app.post('/createSession', (req, res) => {
  const sessionID = uuid();
  sessions[sessionID] = { id: sessionID, members: [], showVote: false };
  res.json(sessionID);
});

// REST endpoint to add/join a user to an existing session
app.post('/joinSession', (req, res) => {
  const { sessionID, userID, userName } = req.body;
  const s = sessions[sessionID];
  if (!s) return res.status(404).send('Session not found');
  if (!s.members.some(m => m.userID === userID)) {
    s.members.push({ userID, userName, vote: null });
  }
  io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  res.sendStatus(200);
});

// Show votes
app.post('/showVotes', (req, res) => {
  const { sessionID } = req.body;
  const s = sessions[sessionID];
  if (!s) return res.status(404).send('Session not found');
  s.showVote = true;
  io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  res.sendStatus(200);
});

// Clear votes
app.post('/clearVotes', (req, res) => {
  const { sessionID } = req.body;
  const s = sessions[sessionID];
  if (!s) return res.status(404).send('Session not found');
  s.showVote = false;
  s.members.forEach(m => (m.vote = null));
  io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
