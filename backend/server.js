import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { createApp, attachSocket } from './src/app.js';

const PORT = process.env.PORT || 4000;
const app = createApp();
const server = http.createServer(app);

attachSocket(server);

const io = new Server(server, {
  cors: {
    origin: "https://chimney-app.vercel.app",
    methods: ["GET","POST"]
  },
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
