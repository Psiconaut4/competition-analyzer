import { Router } from 'express';
import { runMarketAnalysis } from '../services/marketPipeline.service.js';

const router = Router();

// =============================
// 📊 MARKET ANALYSIS
// =============================

router.get('/analyze', async (req, res) => {
  const { keyword, city, max } = req.query;

  // validação básica
  if (!keyword || !city) {
    return res.status(400).json({
      error: 'keyword e city são obrigatórios',
      example: '/market/analyze?keyword=barbearia&city=Joinville'
    });
  }

  const maxItems = Math.min(Number(max) || 20, 50);

  try {
    console.log(`📊 ${keyword} em ${city}`);

    const result = await runMarketAnalysis(keyword, city, {
      maxItems
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('❌ Erro:', err.message);

    return res.status(500).json({
      success: false,
      error: 'Erro ao analisar mercado',
      message: err.message
    });
  }
});

// =============================
// ❤️ HEALTH CHECK
// =============================

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'market-analysis',
    timestamp: new Date().toISOString()
  });
});

export default router;