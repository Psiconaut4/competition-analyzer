import { scrapeGoogleMaps } from '../scrapers/googleMapsScraper.js';
import { analyzeBusinessViability } from './llmAnalyzer.js';
import { normalizeCompetitor } from '../utils/normalizer.js';

export async function getLeads(keyword, city, options = {}) {
  const competitors = await scrapeGoogleMaps(keyword, city, options);

  // Normalizar dados dos concorrentes
  const normalized = competitors.map(normalizeCompetitor);

  // Analisar viabilidade com LLM
  const analysis = await analyzeBusinessViability(keyword, city, normalized);

  return {
    analysis,
    competitors: normalized.sort((a, b) => b.reviews - a.reviews)
  };
}