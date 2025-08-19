import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;

// Express app
const app = express();

// ✅ Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",            // Local dev
    "https://chimney-app-ejck.vercel.app" // Deployed frontend
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket.io server
const io = new Server(server, {
  cors: {
    origin: "https://chimney-app-ejck.vercel.app", // apna frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// ✅ Socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Example API route
app.get("/", (req, res) => {
  res.send("🔥 Chimney Solutions Backend is running ✅");
});



// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
