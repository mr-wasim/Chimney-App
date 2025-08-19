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
  origin: ["https://chimney-app-ejck.vercel.app" // Deployed frontend
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

// Dummy auth route (remove if already defined somewhere else)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({ success: true, message: "Login successful!" });
  }
  res.status(400).json({ success: false, message: "Invalid credentials" });
});

app.get("/testdb", async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection("users").findOne({});
    res.json({ status: "✅ Connected", sampleUser: users });
  } catch (err) {
    res.status(500).json({ status: "❌ Not Connected", error: err.message });
  }
});
// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
