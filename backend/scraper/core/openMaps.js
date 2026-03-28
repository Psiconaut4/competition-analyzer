export async function openMaps(page, keyword, city) {
  const searchTerm = `${keyword} ${city}`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;

  await page.goto(url, {
    waitUntil: 'load',
    timeout: 30000
  });

  return searchTerm;
}