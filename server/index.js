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

const sessions = {}; // in-memory store { [sessionID]: { id, members: [], showVote } }

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', sessionID => {
    socket.join(sessionID);
    const s = sessions[sessionID];
    if (s) io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  });

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
});

app.post('/createSession', (req, res) => {
  const sessionID = uuid();
  sessions[sessionID] = { id: sessionID, members: [], showVote: false };
  res.json(sessionID);
});

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

app.post('/showVotes', (req, res) => {
  const { sessionID } = req.body;
  const s = sessions[sessionID];
  if (!s) return res.status(404).send('Session not found');
  s.showVote = true;
  io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  res.sendStatus(200);
});

app.post('/clearVotes', (req, res) => {
  const { sessionID } = req.body;
  const s = sessions[sessionID];
  if (!s) return res.status(404).send('Session not found');
  s.showVote = false;
  s.members.forEach(m => (m.vote = null));
  io.to(sessionID).emit(`fetchData-${sessionID}`, s);
  res.sendStatus(200);
});

const PORT = 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
