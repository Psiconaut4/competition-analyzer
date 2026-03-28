// =============================
// 🤖 LLM ANALYZER COM NVIDIA API
// =============================

// URLs possíveis (testar qual funcionará)
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Função para analisar viabilidade de negócio com LLM
export async function analyzeBusinessViability(keyword, city, competitors) {
    // Ler a chave no momento da execução, não na inicialização
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

    if (!NVIDIA_API_KEY) {
        console.error('❌ NVIDIA_API_KEY não configurada. Verifique backend/.env');
        return generateFallbackAnalysis(keyword, city, competitors);
    }

    try {
        console.log(`🤖 Analisando viabilidade com NVIDIA LLM...`);
        console.log(`📌 URL: ${NVIDIA_API_URL}`);

        // Preparar dados dos competidores para o prompt
        const competitorsSummary = competitors
            .slice(0, 10)
            .map((c, i) => `${i + 1}. ${c.name} - Rating: ${c.rating}⭐ (${c.reviews} reviews)`)
            .join('\n');

        const systemPrompt = `Você é um especialista em análise de mercado e viabilidade de negócios. Analise os dados de concorrência fornecidos e forneça uma análise REALISTA e FUNDAMENTADA sobre a viabilidade de abrir um novo negócio nesse segmento de mercado.

Seja honesto e prático nas suas recomendações. Use dados reais dos competidores para justificar suas conclusões.

Responda em português do Brasil e estruture sua resposta assim:
1. Viabilidade (0-100%)
2. Desafios Principais (3-4 pontos)
3. Oportunidades (3-4 pontos)  
4. Recomendação Final (uma frase clara)
5. Próximos Passos (ações recomendadas)`;

        const userPrompt = `Analise a viabilidade de abrir um negócio de "${keyword}" na cidade de "${city}".

Dados dos competidores encontrados no Google Maps:
${competitorsSummary}

Total de competidores encontrados: ${competitors.length}
Rating médio: ${(competitors.reduce((acc, c) => acc + c.rating, 0) / competitors.length).toFixed(2)}⭐
Quantidade média de reviews: ${Math.round(competitors.reduce((acc, c) => acc + c.reviews, 0) / competitors.length)}

Forneça uma análise detalhada sobre a viabilidade desse negócio nesse mercado específico.`;

        const requestBody = {
            model: 'mistralai/mistral-7b-instruct-v0.2',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9
        };

        console.log(`📤 Enviando para NVIDIA API com modelo: ${requestBody.model}`);

        const response = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`📥 Status da resposta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na API NVIDIA (Status:', response.status + ')');
            console.error('📋 Headers:', Object.fromEntries(response.headers.entries()));
            console.error('📝 Resposta:', errorText.substring(0, 500));
            console.error('💡 Dica: Verifique se a chave API tem acesso a este modelo');
            return generateFallbackAnalysis(keyword, city, competitors);
        }

        const responseText = await response.text();

        // Validar se é JSON válido
        if (!responseText || !responseText.trim().startsWith('{')) {
            console.error('❌ Resposta inválida da API NVIDIA (não é JSON)');
            console.error('📝 Primeiros 200 caracteres:', responseText.substring(0, 200));
            return generateFallbackAnalysis(keyword, city, competitors);
        }

        const data = JSON.parse(responseText);
        const llmResponse = data.choices?.[0]?.message?.content;

        if (!llmResponse) {
            console.error('❌ Resposta vazia da API NVIDIA');
            console.error('🔍 Estrutura da resposta:', JSON.stringify(data).substring(0, 500));
            return generateFallbackAnalysis(keyword, city, competitors);
        }

        console.log(`✅ Análise LLM concluída com sucesso!`);

        // Parsear a resposta da LLM
        return parseLLMResponse(llmResponse, keyword, city, competitors);

    } catch (err) {
        console.error(`❌ Erro ao chamar LLM: ${err.message}`);
        return generateFallbackAnalysis(keyword, city, competitors);
    }
}

// Parsear a resposta estruturada da LLM
function parseLLMResponse(response, keyword, city, competitors) {
    const analysis = {
        keyword,
        city,
        viablityScore: 0,
        challenges: [],
        opportunities: [],
        recommendation: '',
        nextSteps: [],
        rawAnalysis: response,
        competitorsAnalyzed: competitors.length,
        avgRating: parseFloat((
            competitors.reduce((acc, c) => acc + c.rating, 0) / competitors.length
        ).toFixed(2))
    };

    // Tentar extrair viabilidade de %
    const viabilityMatch = response.match(/(\d+)\s*%/);
    if (viabilityMatch) {
        analysis.viablityScore = parseInt(viabilityMatch[1]);
    }

    // Extrair desafios
    const challengesSection = response.match(/Desafios?[:\s]*([\s\S]*?)(?=Oportunidade|Recomendação|$)/i);
    if (challengesSection) {
        const lines = challengesSection[1].split('\n').filter(l => l.trim());
        analysis.challenges = lines.slice(0, 4).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l);
    }

    // Extrair oportunidades
    const opportunitiesSection = response.match(/Oportunidade[s]?[:\s]*([\s\S]*?)(?=Recomendação|Próximo|$)/i);
    if (opportunitiesSection) {
        const lines = opportunitiesSection[1].split('\n').filter(l => l.trim());
        analysis.opportunities = lines.slice(0, 4).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l);
    }

    // Extrair recomendação final
    const recommendationMatch = response.match(/Recomendação[:\s]*(.*?)(?:\n|$)/i);
    if (recommendationMatch) {
        analysis.recommendation = recommendationMatch[1].trim();
    }

    // Extrair próximos passos
    const stepsSection = response.match(/Próximo[s]?\s*Passo[s]?[:\s]*([\s\S]*?)$/i);
    if (stepsSection) {
        const lines = stepsSection[1].split('\n').filter(l => l.trim());
        analysis.nextSteps = lines.slice(0, 5).map(l => l.replace(/^[-•*\d.]\s*/, '').trim()).filter(l => l);
    }

    return analysis;
}

// Análise fallback quando LLM não está disponível
// Mantém extrema honestidade - nenhum dado fictício
function generateFallbackAnalysis(keyword, city, competitors) {
    const avgRating = competitors && competitors.length > 0
        ? parseFloat((competitors.reduce((acc, c) => acc + c.rating || 0, 0) / competitors.length).toFixed(2))
        : null;

    const competitorCount = competitors?.length || 0;
    const hasValidRatings = competitors?.some(c => c.rating !== null && c.rating !== undefined);
    const hasValidReviews = competitors?.some(c => c.reviews !== null && c.reviews !== undefined);

    return {
        keyword,
        city,
        viablityScore: null,  // Sem dados LLM, não inventamos score
        challenges: [
            competitorCount === 0
                ? '⚠️ Nenhuma empresa foi encontrada no Google Maps'
                : `${competitorCount} competidores encontrados no Google Maps`,
            hasValidRatings
                ? `Avaliação média: ${avgRating}⭐`
                : '⚠️ Dados de avaliação indisponíveis (limite do Google Maps)',
            '❌ API NVIDIA não está configurada - análise de viabilidade desabilitada'
        ],
        opportunities: [
            'Configure sua chave API NVIDIA em backend/.env para análise AI habilitada',
            'Revise manualmente os concorrentes listados',
            'Faça pesquisa de mercado localizado'
        ],
        recommendation: '⚠️ Análise incompleta - Configure NVIDIA_API_KEY no arquivo .env para habilitar análise com IA.',
        nextSteps: [
            '1. Obter chave API em: https://build.nvidia.com/meta/llama-2-70b-chat',
            '2. Adicionar NVIDIA_API_KEY ao arquivo backend/.env',
            '3. Reiniciar servidor Node.js',
            '4. Reenviar consulta para análise completa com IA'
        ],
        rawAnalysis: 'FALLBACK MODE - Configuração incompleta',
        competitorsAnalyzed: competitorCount,
        avgRating: avgRating,
        dataQuality: {
            hasRatings: hasValidRatings,
            hasReviews: hasValidReviews,
            llmEnabled: false,
            message: 'Somente dados reais do Google Maps (sem dados mockados ou preparados)'
        }
    };
}
