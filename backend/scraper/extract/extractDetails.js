import { DETAIL_SELECTORS } from '../config/selectors.js';

export async function extractCompetitors(page, elements, maxItems, city) {
  const results = [];
  const seen = new Set();

  for (let i = 0; i < Math.min(elements.length, maxItems + 5); i++) {
    try {
      const el = elements[i];

      const text = await el.innerText().catch(() => '');
      if (!text) continue;

      const lines = text.split('\n').filter(l => l.trim());
      const name = lines[0]?.trim();

      if (!name || seen.has(name) || name.length > 100) continue;

      seen.add(name);

      //  CLICA NA EMPRESA
      await el.click().catch(() => {});
      await page.waitForTimeout(1500);

      //  EXTRAI WEBSITE REAL DO CARTÃO
      let website = null;
      try {
        const btn = await page.$(DETAIL_SELECTORS.websiteButton);
        if (btn) {
          website = await btn.getAttribute('href');
        }
      } catch {}

      let mapsUrl = page.url();

      results.push({
        name,
        rating: extractRating(text),
        reviews: extractReviews(text),
        address: `${city}, Brasil`,
        website,
        mapsUrl,
        source: 'google-maps-real'
      });

    } catch {}
  }

  return results.slice(0, maxItems);
}

// ===== helpers (mantidos da sua lógica) =====

function extractRating(text) {
  const match = text.match(/(\d+[.,]\d+)/);
  if (!match) return null;

  const val = parseFloat(match[1].replace(',', '.'));
  return val >= 0 && val <= 5 ? val : null;
}

function extractReviews(text) {
  const match = text.match(/\((\d{1,6})\)/);
  if (!match) return null;

  return parseInt(match[1]);
}