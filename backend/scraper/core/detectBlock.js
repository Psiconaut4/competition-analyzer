export async function detectBlock(page) {
  const bodyText = await page.textContent('body').catch(() => '');

  if (!bodyText) return false;

  return (
    bodyText.includes('recaptcha') ||
    bodyText.includes('detected unusual traffic')
  );
}