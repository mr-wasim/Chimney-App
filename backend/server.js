import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;

// Express app
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://chimney-app-ejck.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chimney-app-ejck.vercel.app"],
    methods: ["GET", "POST"]
  }
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
