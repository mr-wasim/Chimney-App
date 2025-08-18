import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { createApp, attachSocket } from './src/app.js';
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const app = createApp();
const server = http.createServer(app);

attachSocket(server);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chimney-app-ejck.vercel.app"],
    methods: ["GET", "POST"]
  }
});


server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
