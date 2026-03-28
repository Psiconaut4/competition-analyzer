// Carregar variáveis de ambiente PRIMEIRO (antes de qualquer outra coisa)
import dotenv from 'dotenv';
dotenv.config();

// Depois importar o resto
import express from 'express';
import cors from 'cors';
import leadRoutes from './routes/leads.js';

const app = express();

// CORS mais permissivo em desenvolvimento
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/leads', leadRoutes);
app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});