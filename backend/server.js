const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Notify others when a new user joins
  socket.on('join-room', () => {
    socket.broadcast.emit('user-joined', socket.id);
  });

  // Handle WebRTC signaling messages
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // Broadcast play, pause, and seek events to all users
  socket.on('video-control', (data) => {
    io.emit('video-control', data);
  });

  // Handle seeking
  socket.on('seek-video', (timestamp) => {
    io.emit('seek-video', timestamp);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const ipAddress = '192.168.1.13';
const port = process.env.PORT || 8000;

server.listen(port, ipAddress, () => {
  console.log(`Server running on http://${ipAddress}:${port}`);
});