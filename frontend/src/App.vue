<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <h1>📊 Analisador de Concorrência</h1>
        <p class="subtitle">Vale a pena abrir meu negócio nessa região?</p>
      </div>
    </header>

    <div class="search-section">
      <div class="search-container">
        <div class="input-group">
          <input v-model="keyword" placeholder="Tipo de negócio (ex: barbearia)" @keyup.enter="analisar" />
          <input v-model="city" placeholder="Cidade (ex: Joinville)" @keyup.enter="analisar" />
        </div>

        <button @click="analisar" :disabled="loading || !keyword || !city" class="btn-search">
          {{ loading ? '⏳ Analisando...' : '🔍 Analisar' }}
        </button>
      </div>
    </div>

    <!-- Mensagem de erro -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>

    <!-- Análise de Concorrência -->
    <div v-if="analysis" class="analysis-container">
      <!-- Card da Recomendação LLM -->
      <div class="llm-recommendation-card">
        <div class="llm-header">
          <div class="viability-badge" :class="getViabilityClass()">
            <p class="viability-percent">{{ analysis.viablityScore }}%</p>
            <p class="viability-label">Viabilidade</p>
          </div>
          <div class="llm-title">
            <h2>{{ analysis.recommendation }}</h2>
            <p class="llm-insight">Análise realizada com IA em tempo real</p>
          </div>
        </div>
      </div>

      <!-- Desafios -->
      <div v-if="analysis.challenges && analysis.challenges.length" class="challenges-card">
        <h3>⚠️ Desafios Principais</h3>
        <ul class="challenge-list">
          <li v-for="(challenge, idx) in analysis.challenges" :key="`challenge-${idx}`">
            {{ challenge }}
          </li>
        </ul>
      </div>

      <!-- Oportunidades -->
      <div v-if="analysis.opportunities && analysis.opportunities.length" class="opportunities-card">
        <h3>🚀 Oportunidades</h3>
        <ul class="opportunity-list">
          <li v-for="(opportunity, idx) in analysis.opportunities" :key="`opp-${idx}`">
            {{ opportunity }}
          </li>
        </ul>
      </div>

      <!-- Próximos Passos -->
      <div v-if="analysis.nextSteps && analysis.nextSteps.length" class="next-steps-card">
        <h3>📋 Próximos Passos Recomendados</h3>
        <ol class="steps-list">
          <li v-for="(step, idx) in analysis.nextSteps" :key="`step-${idx}`">
            {{ step }}
          </li>
        </ol>
      </div>

      <!-- Métricas do Mercado -->
      <div class="market-metrics">
        <h3>📊 Dados dos Concorrentes</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🏢</div>
            <div class="metric-content">
              <p class="metric-value">{{ analysis.competitorsAnalyzed }}</p>
              <p class="metric-label">Concorrentes Analisados</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">⭐</div>
            <div class="metric-content">
              <p class="metric-value">{{ analysis.avgRating }}</p>
              <p class="metric-label">Avaliação Média</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Concorrentes -->
      <div class="competitors-section">
        <h3>🏪 Concorrência direta encontrada na região: ({{ competitors.length }})</h3>

        <div class="competitors-grid">
          <div v-for="(competitor, idx) in competitors" :key="idx" class="competitor-card">
            <div class="competitor-header">
              <h4>{{ competitor.name }}</h4>
              <div class="rating-badge">{{ competitor.rating }}⭐</div>
            </div>

            <div class="competitor-info">
              <p><strong>Reviews:</strong> {{ competitor.reviews }}</p>
              <p><strong>Endereço:</strong> {{ competitor.address }}</p>
              <p v-if="competitor.phone"><strong>Tel:</strong> {{ competitor.phone }}</p>

              <div class="website-info">
                <span v-if="competitor.hasWebsite" class="badge-website">✓ Com Site</span>
                <span v-else class="badge-no-website">✗ Sem Site</span>
              </div>
            </div>

            <a v-if="competitor.mapsUrl" :href="competitor.mapsUrl" target="_blank" class="maps-link">
              Ver no Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem inicial -->
    <div v-if="!analysis && !error && !loading" class="empty-state">
      <p>Digite um tipo de negócio e uma cidade para analisar a concorrência na região!</p>
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer.vue'
export default {
  components: {
    Footer
  },
  data() {
    return {
      keyword: '',
      city: '',
      analysis: null,
      competitors: [],
      loading: false,
      error: null,
      marketHealth: {}
    };
  },
  methods: {
    async analisar() {
      if (!this.keyword || !this.city) {
        this.error = 'Por favor, preencha o tipo de negócio e a cidade';
        return;
      }

      this.loading = true;
      this.error = null;
      this.analysis = null;
      this.competitors = [];

      try {
        const response = await fetch(
          `/leads?keyword=${encodeURIComponent(this.keyword)}&city=${encodeURIComponent(this.city)}`
        );

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Processar resposta com análise e concorrentes
        if (data.analysis) {
          this.analysis = data.analysis;
          this.competitors = data.competitors || [];
          this.marketHealth = data.analysis.marketHealth || {};
        } else {
          this.error = 'Formato de resposta inválido';
        }

      } catch (err) {
        console.error('Erro:', err);
        this.error = `Erro ao analisar: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },

    getViabilityClass() {
      const score = this.analysis?.viablityScore || 0;
      if (score >= 70) return 'viability-excellent';
      if (score >= 50) return 'viability-good';
      if (score >= 30) return 'viability-moderate';
      return 'viability-risky';
    }
  }
};
</script>