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

  // Handle camera stream from a user
  socket.on('camera-stream', ({ userId, stream }) => {
    socket.broadcast.emit('camera-stream', { userId, stream });
  });

  // Handle WebRTC signaling messages
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // Notify when camera is toggled on/off
  socket.on('camera-toggle', ({ active }) => {
    io.emit('camera-toggle', { userId: socket.id, active });
  });

  // Broadcast play, pause, and seek events to all users
  socket.on('video-control', (data) => {
    io.emit('video-control', data);
  });

  // Handle seeking
  socket.on('seek-video', (timestamp) => {
    io.emit('seek-video', timestamp);
  });

  // Handle chat messages
  socket.on('send-message', (message) => {
    socket.broadcast.emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    socket.broadcast.emit('user-left', socket.id);
  });
});

const ipAddress = 'localhost'; // or '192.168.1.13'
const port = process.env.PORT || 8000;

server.listen(port, ipAddress, () => {
  console.log(`Server running on http://${ipAddress}:${port}`);
});
