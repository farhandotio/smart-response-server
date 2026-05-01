import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocket } from './src/config/socket.js';
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    initSocket(server);
    await connectDB();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
