import dotenv from 'dotenv';
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
dotenv.config();

const startServer = async () => {
    try {
        await connectDB();
        app.listen(3000, () => {
            console.log('Server listening on port 3000');
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
