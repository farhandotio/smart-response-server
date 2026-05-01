import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ User Connected to Socket:', socket.id);

    socket.on('join-company', (companyId) => {
      socket.join(companyId);
      console.log(`User joined room: ${companyId}`);
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected');
    });

    return io;
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
