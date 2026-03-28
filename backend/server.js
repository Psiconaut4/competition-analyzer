// =============================
// ⚙️ BOOTSTRAP
// =============================

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import marketRoutes from './routes/market.routes.js';

const app = express();

// =============================
// 🔐 CORS
// =============================

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // permite requests sem origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// =============================
// MIDDLEWARES
// =============================

app.use(express.json());

// =============================
// ROUTES
// =============================

app.use('/market', marketRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString()
  });
});

// =============================
// SERVER START
// =============================

const PORT = process.env.PORT || 3000;

// ⚠️ importante: não fixar localhost em produção
const HOST = process.env.NODE_ENV === 'production'
  ? '0.0.0.0'
  : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`\n✅ API rodando em http://${HOST}:${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
});