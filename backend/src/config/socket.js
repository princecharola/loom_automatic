import { Server } from 'socket.io';

let ioInstance;

export function initializeSocket(server, options = {}) {
  ioInstance = new Server(server, {
    cors: {
      origin: options.clientOrigin || '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('machine:subscribe', (machineId) => {
      if (machineId) {
        socket.join(`machine:${machineId}`);
        socket.emit('machine:subscribed', { machineId });
      }
    });
  });

  return ioInstance;
}

export function getSocket() {
  if (!ioInstance) {
    throw new Error('Socket.io is not initialized.');
  }

  return ioInstance;
}
