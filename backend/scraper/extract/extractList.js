import { LIST_SELECTORS } from '../config/selectors.js';

export async function getListElements(page) {
  for (const selector of LIST_SELECTORS) {
    const elements = await page.$$(selector);
    if (elements.length > 0) return elements;
  }
  return [];
}