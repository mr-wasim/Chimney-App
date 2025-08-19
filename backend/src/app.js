import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import techRoutes from './routes/tech.routes.js';
import { initModels } from './models/index.js';
import { seedAdminIfNeeded } from './utils/seedAdmin.js';
import { Server } from 'socket.io';

export function createApp() {
  const app = express();

  // Security & utilities
  app.use(helmet());
  app.use(xss());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());
  app.set('trust proxy', 1);

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use(cors({
    origin: corsOrigin === '*' ? true : [corsOrigin],
    credentials: true
  }));

  app.use(cors({
    origin: ["https://chimney-app-ejck.vercel.app"],
    credentials: true
  }));
  // ✅ Allow only your frontend
  app.use(cors({
    origin: "https://chimney-app-ejck.vercel.app", // apna frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

  app.use(express.json());

  const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
  app.use(limiter);

  // DB
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI');
  }
  mongoose.connect(MONGO_URI, { dbName: 'chimney_crm' })
    .then(() => console.log('MongoDB connected'))
    .then(seedAdminIfNeeded)
    .catch(err => console.error('Mongo error', err));

  initModels();

  // Routes
  app.get('/', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/tech', techRoutes);
  app.get("/api/test", (req, res) => {
  res.send("✅ Test route working fine on Render");
});

  // 404
  app.use((req, res) => res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' }));
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server Error' });
  });

  return app;
}

export function attachSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // technician joins room with their userId
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
    });
  });

  // attach to app locals so routes can emit
  server.on('request', (req, res) => {
    req.io = io;
  });
}
