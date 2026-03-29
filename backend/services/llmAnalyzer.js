// =============================
// 🤖 AI MARKET ANALYZER SERVICE
// =============================

const NVIDIA_API_URL =
  process.env.NVIDIA_API_URL ||
  'https://integrate.api.nvidia.com/v1/chat/completions';

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ||
  'mistralai/mistral-7b-instruct-v0.2';

// =============================
// ENTRY POINT
// =============================

export async function analyzeBusinessViability(keyword, city, competitors = []) {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

  if (!NVIDIA_API_KEY) {
    return generateFallbackAnalysis(keyword, city, competitors);
  }

  try {
    const { systemPrompt, userPrompt } = buildPrompt(
      keyword,
      city,
      competitors
    );

    const llmResponse = await callLLM(
      NVIDIA_API_KEY,
      systemPrompt,
      userPrompt
    );

    if (!llmResponse) {
      return generateFallbackAnalysis(keyword, city, competitors);
    }

    return parseLLMResponse(llmResponse, keyword, city, competitors);
  } catch (err) {
    console.error('❌ LLM error:', err.message);
    return generateFallbackAnalysis(keyword, city, competitors);
  }
}

//
// =============================
// PROMPT
// =============================
//

function buildPrompt(keyword, city, competitors) {
  const safeCompetitors = competitors.slice(0, 10);

  const competitorsSummary = safeCompetitors
    .map((c, i) => {
      const rating = c.rating ?? 'N/A';
      const reviews = c.reviews ?? 'N/A';

      return `${i + 1}. ${c.name} - Rating: ${rating} (${reviews} reviews)`;
    })
    .join('\n');

  const avgRating = calculateAvg(competitors, 'rating');
  const avgReviews = calculateAvg(competitors, 'reviews');

  const systemPrompt = `
Você é um especialista em análise de mercado.
Seja direto, realista, pragmático, objetivo e baseado nos dados.
Use os dados de concorrência para fundamentar sua análise.
Seja crítico e destaque tanto os desafios quanto as oportunidades.
`;

  const userPrompt = `
Analise a viabilidade de abrir um negócio de "${keyword}" em "${city}" com base nos concorrentes listados.
preencha as seções de forma clara e estruturada não deixe nenhuma seção vazia ou com simbolos de preenchimento.
não faça listas indo de a a c, prefira somente o texto
Responda em português do Brasil.

Concorrentes:
${competitorsSummary}

Total: ${competitors.length}
Rating médio: ${avgRating ?? 'N/A'}
Reviews médio: ${avgReviews ?? 'N/A'}

Estruture:
1. Viabilidade (0-100%)
2. Desafios (4)
3. Oportunidades (4)
4. Recomendação
5. Próximos passos
`;

  return { systemPrompt, userPrompt };
}

//
// =============================
// LLM CALL
// =============================
//

async function callLLM(apiKey, systemPrompt, userPrompt) {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    console.error('❌ NVIDIA API error:', response.status);
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

//
// =============================
// PARSER
// =============================
//

function parseLLMResponse(response, keyword, city, competitors) {
  const avgRating = calculateAvg(competitors, 'rating');

  const analysis = {
    keyword,
    city,
    viabilityScore: extractPercentage(response),
    challenges: extractList(response, /Desafios?/i),
    opportunities: extractList(response, /Oportunidades?/i),
    recommendation: extractLine(response, /Recomendação/i),
    nextSteps: extractList(response, /Próximos?\s*Passos?/i),
    rawAnalysis: response,
    competitorsAnalyzed: competitors.length,
    avgRating
  };

  return analysis;
}

//
// =============================
// HELPERS
// =============================
//

function calculateAvg(list, field) {
  const values = list
    .map(item => Number(item[field]))
    .filter(v => !isNaN(v) && v > 0);

  if (values.length === 0) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Number(avg.toFixed(2));
}

function extractPercentage(text) {
  const match = text.match(/(\d{1,3})\s*%/);
  return match ? parseInt(match[1]) : 0;
}

function extractList(text, regex) {
  const section = text.split(regex)[1];
  if (!section) return [];

  return section
    .split('\n')
    .map(l => l
      .replace(/^[a-z]\.\s+/i, '')     // Remove "a. b. c. d." com ponto
      .replace(/^[a-z]\)\s*/i, '')     // Remove "a) b) c)" com parêntese
      .replace(/^[-•*\d.]+\s*/, '')    // Remove "1. 2. 3." ou "-"
      .trim()
    )
    .filter(l => {
      // Remove vazios, linhas com só pontuação, e cabeçalhos
      const isHeader = /^(desafios|oportunidades|recomendação|próximos?\s+passos|next\s+steps|challenges|opportunities)[\s:]*$/i.test(l);
      const isEmpty = !l || l.length < 3;
      const isPunctuation = /^[.,;:\-•*]+$/.test(l);
      return !isHeader && !isEmpty && !isPunctuation;
    })
    .slice(0, 5);
}

function extractLine(text, regex) {
  const match = text.match(new RegExp(`${regex.source}[:\\s]*(.*)`, 'i'));
  return match ? match[1].trim() : '';
}

//
// =============================
// FALLBACK
// =============================
//

function generateFallbackAnalysis(keyword, city, competitors) {
  const avgRating = calculateAvg(competitors, 'rating');

  return {
    keyword,
    city,
    viabilityScore: null,
    challenges: [
      `${competitors.length} competidores encontrados`,
      avgRating ? `Rating médio: ${avgRating}` : 'Sem dados de avaliação',
      'LLM não configurada'
    ],
    opportunities: [
      'Configurar API NVIDIA',
      'Analisar concorrência manualmente'
    ],
    recommendation: 'Análise limitada sem IA',
    nextSteps: [
      'Configurar NVIDIA_API_KEY',
      'Reexecutar análise'
    ],
    rawAnalysis: 'FALLBACK',
    competitorsAnalyzed: competitors.length,
    avgRating,
    llmEnabled: false
  };
}