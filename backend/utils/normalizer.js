// =============================
// NORMALIZAR CONCORRENTE PARA ANÁLISE
// =============================

export function normalizeCompetitor(data) {
  // Validar e converter rating
  let rating = 0;
  if (data.rating !== null && data.rating !== undefined) {
    rating = parseFloat(data.rating);
    if (isNaN(rating)) rating = 0;
    rating = Math.max(0, Math.min(5, rating));
  }

  // Validar e converter reviews
  let reviews = 0;
  if (data.reviews !== null && data.reviews !== undefined) {
    reviews = typeof data.reviews === 'number' ? data.reviews : parseInt(data.reviews);
    if (isNaN(reviews)) reviews = 0;
    reviews = Math.max(0, reviews);
  }

  return {
    id: data.id || null,
    name: data.name || 'N/A',
    rating: parseFloat(rating.toFixed(1)),
    reviews: reviews,
    address: data.address || 'N/A',
    phone: data.phone || null,
    website: data.website || null,
    hasWebsite: !!data.website,
    mapsUrl: data.mapsUrl || null,
    establishedYears: data.establishedYears || null,
    weeklyViews: data.weeklyViews || 0,
    source: data.source || 'unknown'
  };
}

// Mantém função antiga para compatibilidade
export function normalizeLead(data) {
  return normalizeCompetitor(data);
}