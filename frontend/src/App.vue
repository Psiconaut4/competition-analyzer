<template>
  <div id="app" class="app-wrapper">
    <!-- Barra de Busca com Header -->
    <SearchBar :loading="loading" :error="error" @search="analisar" />

    <!-- Seção de Análise -->
    <div v-if="analysis || loading" class="analysis-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Analisando o mercado...</p>
      </div>

      <div v-if="analysis && !loading" class="analysis-content">
        <!-- Card de Viabilidade -->
        <ViabilityCard :score="analysis.viabilityScore" :recommendation="analysis.recommendation"
          :competitors="analysis.competitorsAnalyzed" :rating="analysis.avgRating" :insight="analysis.insights" />

        <!-- Desafios e Oportunidades -->
        <div class="analysis-columns">
          <ChallengesSection v-if="analysis.challenges && analysis.challenges.length"
            :challenges="analysis.challenges" />
          <OpportunitiesSection v-if="analysis.opportunities && analysis.opportunities.length"
            :opportunities="analysis.opportunities" />
        </div>

        <!-- Próximos Passos -->
        <NextStepsSection v-if="analysis.nextSteps && analysis.nextSteps.length" :steps="analysis.nextSteps" />

        <!-- Lista de Concorrentes -->
        <CompetitorsList :competitors="competitors" />
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-if="!analysis && !loading && !error" class="empty-section">
      <EmptyState />
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue';
import ViabilityCard from './components/ViabilityCard.vue';
import ChallengesSection from './components/ChallengesSection.vue';
import OpportunitiesSection from './components/OpportunitiesSection.vue';
import NextStepsSection from './components/NextStepsSection.vue';
import CompetitorsList from './components/CompetitorsList.vue';
import EmptyState from './components/EmptyState.vue';
import Footer from './components/Footer.vue';
import { LEADS_URL } from './config.js';

export default {
  name: 'App',
  components: {
    SearchBar,
    ViabilityCard,
    ChallengesSection,
    OpportunitiesSection,
    NextStepsSection,
    CompetitorsList,
    EmptyState,
    Footer
  },
  data() {
    return {
      analysis: null,
      competitors: [],
      loading: false,
      error: null
    };
  },
  methods: {
    async analisar(keyword, city) {
      if (!keyword || !city) {
        this.error = 'Por favor, preencha o tipo de negócio e a cidade';
        return;
      }

      this.loading = true;
      this.error = null;
      this.analysis = null;
      this.competitors = [];

      try {
        const response = await fetch(
          `${LEADS_URL}?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // novo formato: { success, data }
        if (data.success && data.data) {
          this.analysis = data.data.analysis;
          this.competitors = data.data.competitors || [];
        } else {
          this.error = 'Formato de resposta inválido';
        }

      } catch (err) {
        console.error('Erro:', err);
        this.error = `Erro ao analisar: ${err.message}`;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>