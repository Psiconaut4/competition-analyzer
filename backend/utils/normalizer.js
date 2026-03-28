// =============================
// NORMALIZAR CONCORRENTE
// =============================

export function normalizeCompetitor(data = {}) {
  return {
    id: data.id ?? null,

    name: normalizeString(data.name),

    rating: normalizeRating(data.rating),

    reviews: normalizeInteger(data.reviews),

    address: normalizeString(data.address),

    phone: normalizeString(data.phone),

    website: normalizeString(data.website),

    hasWebsite: !!data.website,

    mapsUrl: normalizeString(data.mapsUrl),

    source: data.source || 'google-maps'
  };
}

// =============================
// HELPERS
// =============================

function normalizeString(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRating(value) {
  const num = Number(value);

  if (isNaN(num)) return null;

  return Math.max(0, Math.min(5, Number(num.toFixed(1))));
}

function normalizeInteger(value) {
  const num = Number(value);

  if (isNaN(num)) return null;

  return Math.max(0, Math.floor(num));
}

// =============================
// LEGACY COMPAT
// =============================

export function normalizeLead(data) {
  return normalizeCompetitor(data);
}