import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:dashboard', () => socket.join('dashboard'));
  });

  return io;
}

export function getSocket() {
  if (!io) {
    throw new Error('Socket.io not initialized.');
  }
  return io;
}
