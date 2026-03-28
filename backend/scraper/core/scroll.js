export async function scrollResults(page) {
  try {
    const container = page.locator('[role="region"]').first();

    let previousHeight = 0;

    for (let i = 0; i < 3; i++) {
      const currentHeight = await container.evaluate(el => {
        el.scrollTop = el.scrollHeight;
        return el.scrollHeight;
      });

      if (currentHeight === previousHeight) break;

      previousHeight = currentHeight;
      await page.waitForTimeout(800);
    }
  } catch {
    // opcional
  }
}