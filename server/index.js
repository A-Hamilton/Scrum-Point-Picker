// server/index.js
const express = require('express');
const cors    = require('cors');
const app     = express();
app.use(cors());

const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => { console.log('🔌', socket.id); /* … */ });
httpServer.listen(4000, () => console.log('🚀 on 4000'));
