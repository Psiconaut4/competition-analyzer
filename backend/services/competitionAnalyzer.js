// =============================
// 📊 ANALISADOR DE CONCORRÊNCIA
// =============================

export class CompetitionAnalyzer {
    constructor(competitors, keyword, city) {
        this.competitors = competitors;
        this.keyword = keyword;
        this.city = city;
    }

    // Calcula a viabilidade de abrir um negócio na região
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

        // Calcula score de oportunidade
        metrics.opportunityScore = this.calculateOpportunityScore();
        metrics.recommendation = this.generateRecommendation(metrics);
        metrics.insights = this.generateInsights(metrics);
        metrics.marketHealth = this.analyzeMarketHealth();

        return metrics;
    }

    calculateAvgRating() {
        if (this.competitors.length === 0) return 0;
        const sum = this.competitors.reduce((acc, c) => acc + parseFloat(c.rating), 0);
        return parseFloat((sum / this.competitors.length).toFixed(2));
    }

    // Calcula o nível de saturação (0-100)
    calculateSaturation() {
        const count = this.competitors.length;

        if (count < 5) return 20;      // Muito pouco saturado
        if (count < 10) return 40;     // Pouco saturado
        if (count < 15) return 60;     // Moderadamente saturado
        if (count < 25) return 75;     // Muito saturado
        return 90;                     // Extremamente saturado
    }

    // Score de oportunidade (0-100)
    calculateOpportunityScore() {
        let score = 100;

        // Penaliza por muita concorrência
        const saturation = this.calculateSaturation();
        score -= saturation * 0.4;

        // Bônus se há qualidade baixa (oportunidade de fazer melhor)
        const avgRating = this.calculateAvgRating();
        if (avgRating < 3.5) {
            score += 20;
        } else if (avgRating < 4.0) {
            score += 10;
        }

        // Bônus se poucos têm website
        const withWebsite = this.competitors.filter(c => c.website).length;
        if (withWebsite < this.competitors.length * 0.3) {
            score += 10;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    generateRecommendation(metrics) {
        if (metrics.opportunityScore >= 70) {
            return '✅ EXCELENTE OPORTUNIDADE - Vale muito a pena abrir um negócio nesse segmento!';
        } else if (metrics.opportunityScore >= 50) {
            return '🟢 BOA OPORTUNIDADE - É viável, mas haverá concorrência moderada';
        } else if (metrics.opportunityScore >= 30) {
            return '🟡 OPORTUNIDADE LIMITADA - Mercado saturado, mas possível se fizer diferença';
        } else {
            return '🔴 ALTO RISCO - Mercado muito saturado, difícil ganhar espaço';
        }
    }

    generateInsights(metrics) {
        const insights = [];

        // Insight sobre concorrência
        if (metrics.totalCompetitors < 5) {
            insights.push('🎯 Poucos concorrentes - Grande espaço de mercado');
        } else if (metrics.totalCompetitors < 15) {
            insights.push('⚡ Concorrência moderada - Bom espaço para diferenciação');
        } else {
            insights.push('⚠️ Mercado saturado - Necessário diferencial competitivo forte');
        }

        // Insight sobre qualidade
        if (metrics.avgRating < 3.7) {
            insights.push('💡 Nível de satisfação baixo - Oportunidade de oferecer melhor qualidade');
        } else if (metrics.avgRating >= 4.3) {
            insights.push('🏆 Clientes satisfeitos - Padrão de qualidade elevado esperado');
        }

        // Insight sobre presença digital
        const withWebsite = this.competitors.filter(c => c.website).length;
        const percentage = Math.round((withWebsite / this.competitors.length) * 100);
        if (percentage < 40) {
            insights.push('📱 Pouca presença digital - Oportunidade de se destacar online');
        } else {
            insights.push('🌐 Boa presença digital - Mercado já é consciente de internet');
        }

        return insights;
    }

    analyzeMarketHealth() {
        const avgReviews = Math.round(
            this.competitors.reduce((acc, c) => acc + c.reviews, 0) / this.competitors.length
        );

        const avgYears = Math.round(
            this.competitors.reduce((acc, c) => acc + c.establishedYears, 0) / this.competitors.length
        );

        return {
            averageReviews: avgReviews,
            averageYearsEstablished: avgYears,
            marketMaturity: avgYears > 8 ? 'Consolidado' : 'Em crescimento',
            competitorLoyalty: avgReviews > 100 ? 'Alta' : 'Moderada'
        };
    }
}

// Função principal de análise
export function analyzeCompetition(competitors, keyword, city) {
    const analyzer = new CompetitionAnalyzer(competitors, keyword, city);
    return analyzer.analyze();
}
