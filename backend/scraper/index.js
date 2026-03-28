import { getBrowser } from './browser/browserManager.js';
import { openMaps } from './core/openMaps.js';
import { scrollResults } from './core/scroll.js';
import { detectBlock } from './core/detectBlock.js';
import { getListElements } from './extract/extractList.js';
import { extractCompetitors } from './extract/extractDetails.js';
import { retry } from './utils/retry.js';

export async function scrapeGoogleMaps(keyword, city, options = {}) {
  const { maxItems = 20, retries = 3 } = options;

  return retry(async () => {
    const browser = await getBrowser();

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    });

    const page = await context.newPage();

    await page.setViewportSize({ width: 1366, height: 768 });

    const searchTerm = await openMaps(page, keyword, city);

    await page.waitForTimeout(2000);

    const blocked = await detectBlock(page);
    if (blocked) throw new Error('Blocked by Google');

    await scrollResults(page);

    const elements = await getListElements(page);

    const data = await extractCompetitors(
      page,
      elements,
      maxItems,
      city
    );

    await context.close();

    return data;
  }, retries);
}