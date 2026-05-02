import 'dotenv/config';
import { config } from './src/config/config.js';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocket } from './src/config/socket.js';

const PORT = config.PORT || 3000;

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
