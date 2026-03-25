import { Server } from 'socket.io';

let io;

export async function initializeSocket(server, options = {}) {
  io = new Server(server, {
    cors: {
      origin: options.clientOrigin || '*'
    }
  });

  io.on('connection', (socket) => {
    socket.on('machine:subscribe', (machineId) => {
      socket.join(`machine:${machineId}`);
    });

    socket.on('machine:unsubscribe', (machineId) => {
      socket.leave(`machine:${machineId}`);
    });
  });

  return io;
}

export function getSocket() {
  if (!io) {
    throw new Error('Socket.io has not been initialized.');
  }

  return io;
}
