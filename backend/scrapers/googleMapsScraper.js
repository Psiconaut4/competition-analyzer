import { chromium } from 'playwright';

// =============================
// � SCRAPER REAL DO GOOGLE MAPS - 100% SEM DADOS MOCKADOS
// =============================
export async function scrapeGoogleMaps(keyword, city, options = {}) {
  const { maxItems = 20 } = options;
  let browser;

  try {
    console.log(`\n📊 Analisando concorrência: ${keyword} em ${city}`);
    console.log(`🔍 Iniciando scraping REAL do Google Maps...`);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    const searchTerm = `${keyword} ${city}`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}/`;

    console.log(`📍 Navegando: ${searchTerm}`);
    await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
    await page.waitForTimeout(6000);

    // Extrair APENAS dados reais do DOM
    const competitorsData = await page.evaluate(async (maxItems) => {
      const results = [];

      // Múltiplos seletores para encontrar elementos
      let elements = document.querySelectorAll('[role="option"]') || [];
      if (elements.length === 0) elements = document.querySelectorAll('.Nv2PK');
      if (elements.length === 0) elements = document.querySelectorAll('[data-item-id]');
      if (elements.length === 0) elements = document.querySelectorAll('div[jsaction]');

      console.log(`[MAPS DOM] Encontrados ${elements.length} elementos`);

      for (let i = 0; i < Math.min(maxItems, elements.length); i++) {
        try {
          const element = elements[i];
          const fullText = (element.innerText || element.textContent || '').trim();

          // Pegar primeira linha como nome
          const lines = fullText.split('\n').filter(l => l.trim());
          const name = lines[0]?.trim();

          if (!name || name.length < 2) continue;

          // Extrair rating REAL do texto
          let rating = null;
          const patterns = [
            /(\d+[.,]\d+?)\s*[★⭐]/,
            /[★⭐]\s*(\d+[.,]\d+?)/,
            /(\d+[.,]\d+)\s*\(/,
            /(\d{1,2}[.,]\d)(?:\s|$)/
          ];

          for (const pattern of patterns) {
            const match = fullText.match(pattern);
            if (match?.[1]) {
              const val = parseFloat(match[1].replace(',', '.'));
              if (val >= 0.1 && val <= 5) {
                rating = val;
                break;
              }
            }
          }

          // Extrair reviews REAL do texto
          let reviews = null;
          const reviewPatterns = [
            /\((\d+)\s*(?:avaliações?|reviews?|resenhas?)\)/i,
            /(\d{1,6})\s*(?:avaliações?|reviews?|resenhas?)/i,
            /\((\d+)\)/
          ];

          for (const pattern of reviewPatterns) {
            const match = fullText.match(pattern);
            if (match?.[1]) {
              reviews = parseInt(match[1].replace(/[.,]/g, ''));
              if (reviews > 0 && reviews < 1000000) break;
            }
          }

          // IMPORTANTE: Só adiciona se tem dados reais
          if ((rating !== null || reviews !== null) && name) {
            results.push({
              name,
              rating,
              reviews,
              rawText: fullText.substring(0, 100)
            });
          }
        } catch (e) {
          // Silenciar erros de parse individual
        }
      }

      return results;
    }, maxItems);

    console.log(`✅ Extraídos ${competitorsData.length} resultados REAIS do Google Maps DOM`);

    if (competitorsData && competitorsData.length > 0) {
      // Mapear para formato final - APENAS dados extraídos do Google Maps
      const competitors = competitorsData.map((comp, idx) => ({
        id: idx,
        name: comp.name,
        rating: comp.rating,  // Valor real ou null
        reviews: comp.reviews, // Valor real ou null
        address: `${city}, Brasil`,
        phone: null,
        website: null,
        mapsUrl: mapsUrl,
        establishedYears: null,
        weeklyViews: null,
        source: 'google-maps-real'
      }));

      // Filtrar para manter apenas com pelo menos nome
      const validCompetitors = competitors.filter(c => c.name);

      await browser.close();
      console.log(`🎯 ✅ ${validCompetitors.length} empresas REAIS extraídas\n`);

      validCompetitors.slice(0, 5).forEach(c => {
        console.log(`  • ${c.name} | Rating: ${c.rating !== null ? c.rating.toFixed(1) + '⭐' : 'N/A'} | Reviews: ${c.reviews || 'N/A'}`);
      });

      return validCompetitors;
    }

    await browser.close();
    console.log(`⚠️ Nenhum dado foi encontrado no Google Maps\n`);
    return [];

  } catch (err) {
    console.error(`❌ Erro na extração: ${err.message}`);
    if (browser) try { await browser.close(); } catch (e) { }
    return [];
  }
}