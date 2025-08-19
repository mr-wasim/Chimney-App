const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const authRoutes = require('./routes/auth.routes.cjs');
const adminRoutes = require('./routes/admin.routes.cjs');
const techRoutes = require('./routes/tech.routes.cjs');
const { initModels } = require('./models/index.cjs');
const { seedAdminIfNeeded } = require('./utils/seedAdmin.cjs');

function createApp() {
  const app = express();

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
  

  const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
  app.use(limiter);

  const MONGO_URI = process.env.MONGO_URI;
  mongoose.connect(MONGO_URI, { dbName: 'chimney_crm' })
    .then(() => console.log('MongoDB connected'))
    .then(seedAdminIfNeeded)
    .catch(err => console.error('Mongo error', err));

  initModels();

  app.get('/', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/tech', techRoutes);

  app.use((req, res) => res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server Error' });
  });

  return app;
}

module.exports = { createApp };
