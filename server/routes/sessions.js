// server/routes/sessions.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sessions = require('../sessionsStore');

const router = express.Router();

// POST /sessions → Create a new session
router.post('/', (req, res) => {
  const sessionID = uuidv4();
  sessions[sessionID] = {
    id: sessionID,
    title: 'Planning Poker',
    creatorId: req.body.user?.userID || null,
    members: [],
    showVote: false,
  };
  res.json({ id: sessionID });
});

// GET /sessions/:id → Retrieve session data
router.get('/:id', (req, res) => {
  const sess = sessions[req.params.id];
  if (!sess) return res.status(404).json({ message: 'Session not found' });
  res.json(sess);
});

module.exports = router;