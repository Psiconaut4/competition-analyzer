// =============================
// 📊 MARKET ANALYSIS SERVICE
// =============================

export class MarketAnalyzer {
  constructor(competitors = [], keyword, city) {
    this.competitors = competitors;
    this.keyword = keyword;
    this.city = city;
  }

  analyze() {
    const metrics = {
      totalCompetitors: this.competitors.length,
      avgRating: this.calculateAvgRating(),
      saturationLevel: this.calculateSaturation(),
      opportunityScore: 0,
      recommendation: '',
      insights: [],
      marketHealth: {}
    };

    metrics.opportunityScore = this.calculateOpportunityScore();
    metrics.recommendation = this.generateRecommendation(metrics);
    metrics.insights = this.generateInsights(metrics);
    metrics.marketHealth = this.analyzeMarketHealth();

    return metrics;
  }

  // =============================
  // MÉTRICAS BASE
  // =============================

  calculateAvgRating() {
    const validRatings = this.competitors
      .map(c => Number(c.rating))
      .filter(r => !isNaN(r) && r > 0);

    if (validRatings.length === 0) return 0;

    const avg =
      validRatings.reduce((acc, r) => acc + r, 0) / validRatings.length;

    return Number(avg.toFixed(2));
  }

  calculateSaturation() {
    const count = this.competitors.length;

    if (count < 5) return 20;
    if (count < 10) return 40;
    if (count < 15) return 60;
    if (count < 25) return 75;
    return 90;
  }

  // =============================
  // SCORE PRINCIPAL
  // =============================

  calculateOpportunityScore() {
    let score = 100;

    const saturation = this.calculateSaturation();
    score -= saturation * 0.4;

    const avgRating = this.calculateAvgRating();

    if (avgRating > 0) {
      if (avgRating < 3.5) score += 20;
      else if (avgRating < 4.0) score += 10;
    }

    const withWebsite = this.competitors.filter(c => !!c.website).length;

    if (
      this.competitors.length > 0 &&
      withWebsite < this.competitors.length * 0.3
    ) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // =============================
  // OUTPUT
  // =============================

  generateRecommendation(metrics) {
    if (metrics.opportunityScore >= 70) {
      return 'EXCELENTE OPORTUNIDADE';
    } else if (metrics.opportunityScore >= 50) {
      return 'BOA OPORTUNIDADE';
    } else if (metrics.opportunityScore >= 30) {
      return 'OPORTUNIDADE LIMITADA';
    } else {
      return 'ALTO RISCO';
    }
  }

  generateInsights(metrics) {
    const insights = [];

    // concorrência
    if (metrics.totalCompetitors < 5) {
      insights.push('Poucos concorrentes');
    } else if (metrics.totalCompetitors < 15) {
      insights.push('Concorrência moderada');
    } else {
      insights.push('Mercado saturado');
    }

    // qualidade
    if (metrics.avgRating > 0) {
      if (metrics.avgRating < 3.7) {
        insights.push('Baixa satisfação dos clientes');
      } else if (metrics.avgRating >= 4.3) {
        insights.push('Alto padrão de qualidade');
      }
    }

    // presença digital
    const withWebsite = this.competitors.filter(c => !!c.website).length;

    if (this.competitors.length > 0) {
      const percentage = Math.round(
        (withWebsite / this.competitors.length) * 100
      );

      if (percentage < 40) {
        insights.push('Baixa presença digital');
      } else {
        insights.push('Boa presença digital');
      }
    }

    return insights;
  }

  // =============================
  // SAÚDE DO MERCADO
  // =============================

  analyzeMarketHealth() {
    const validReviews = this.competitors
      .map(c => Number(c.reviews))
      .filter(r => !isNaN(r) && r > 0);

    const avgReviews =
      validReviews.length > 0
        ? Math.round(
            validReviews.reduce((acc, r) => acc + r, 0) /
              validReviews.length
          )
        : 0;

    return {
      averageReviews: avgReviews,
      marketMaturity: avgReviews > 200 ? 'Consolidado' : 'Em crescimento',
      competitorLoyalty: avgReviews > 100 ? 'Alta' : 'Moderada'
    };
  }
}

// =============================
// FUNÇÃO UTIL
// =============================

export function analyzeMarket(competitors, keyword, city) {
  const analyzer = new MarketAnalyzer(competitors, keyword, city);
  return analyzer.analyze();
}