import { chromium } from 'playwright';
import path from 'path';

let browser;

export async function getBrowser() {
  if (!browser) {
    const isProd = process.env.NODE_ENV === 'production';

    browser = await chromium.launch({
      headless: true,
      executablePath: isProd
        ? path.resolve('./chromium/chromium-linux/chrome')
        : undefined, // deixa o Playwright usar o próprio no dev
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }

  return browser;
}