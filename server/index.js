// server/index.js

// 1. Import and initialize Express BEFORE using it
const express = require('express');
const cors    = require('cors');
const app     = express();                   // ← initialize app first :contentReference[oaicite:0]{index=0}
app.use(cors());                             // enable CORS for all origins

// 2. Create the HTTP server and attach Socket.IO
const httpServer = require('http').createServer(app);  
const { Server } = require('socket.io');
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  // … your existing event handlers (createSession, joinSession, etc.)
});

socket.io.on("open", () => {
  console.log("Engine.IO transport:", socket.io.engine.transport.name);
  // => "polling" initially, then -> "websocket"
});

socket.on("connect", () => {
  console.log("Socket.IO transport:", socket.io.engine.transport.name); // "websocket"
});


// 3. Listen on port 4000 (not 3000)
const PORT = 4000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`)
);
