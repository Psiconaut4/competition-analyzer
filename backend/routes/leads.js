import { Router } from 'express';
import { getLeads } from '../services/leadService.js';

const router = Router();

router.get('/', async (req, res) => {
  const { keyword, city, max = 20 } = req.query;

  // Validação
  if (!keyword || !city) {
    return res.status(400).json({
      error: 'keyword e city são obrigatórios',
      example: '/leads?keyword=barbearia&city=Joinville'
    });
  }

  try {
    console.log(`� Analisando concorrência: ${keyword} em ${city}`);

    const result = await getLeads(keyword, city, {
      maxItems: Math.min(Number(max) || 20, 50)
    });

    console.log(`✅ Análise concluída - ${result.competitors.length} concorrentes`);

    res.json(result);

  } catch (err) {
    console.error('❌ Erro ao analisar:', err.message);
    res.status(500).json({
      error: 'Erro ao analisar concorrência',
      message: err.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;