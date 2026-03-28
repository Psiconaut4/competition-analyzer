import { scrapeGoogleMaps } from '../scraper/index.js';
import { analyzeBusinessViability } from './llmAnalyzer.js';
import { normalizeCompetitor } from '../utils/normalizer.js';

// =============================
// 📊 MARKET PIPELINE SERVICE
// =============================

export async function runMarketAnalysis(keyword, city, options = {}) {
  // 1. Scraping
  const competitorsRaw = await scrapeGoogleMaps(keyword, city, options);

  // 2. Normalização
  const competitors = competitorsRaw.map(normalizeCompetitor);

  // 3. Ordenação segura
  const sortedCompetitors = competitors.sort(
    (a, b) => (b.reviews || 0) - (a.reviews || 0)
  );

  // 4. Análise com LLM
  const analysis = await analyzeBusinessViability(
    keyword,
    city,
    sortedCompetitors
  );

  return {
    analysis,
    competitors: sortedCompetitors,
    meta: {
      total: sortedCompetitors.length,
      keyword,
      city
    }
  };
}