/**
 * 🔧 Configuração do Frontend
 * Centraliza todas as variáveis de ambiente e configurações
 * Variáveis com prefixo VITE_ são substituídas durante o build
 */

// 🌐 URL da API Backend
// Em desenvolvimento: http://localhost:3000 (via proxy do Vite)
// Em produção: URL real do servidor
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 🏪 Endpoint para buscar leads/analisar concorrência
export const LEADS_ENDPOINT = '/market/analyze';

// 🔍 URL completa do endpoint (para requests diretos, se necessário)
export const LEADS_URL = `${API_URL}${LEADS_ENDPOINT}`;

// 🎨 Modo desenvolvimento
export const IS_DEV = import.meta.env.DEV;

// 🔧 Modo produção
export const IS_PROD = import.meta.env.PROD;

// 📦 Ambiente
export const ENV = import.meta.env.MODE; // 'development' ou 'production'

// 📋 Dados da aplicação
export const APP_NAME = 'Competition Analyzer';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Analisador inteligente de concorrência de negócios';

// Log de configuração em desenvolvimento
if (IS_DEV) {
  console.log('🔧 [Configuração Frontend]');
  console.log(`  API_URL: ${API_URL}`);
  console.log(`  LEADS_ENDPOINT: ${LEADS_ENDPOINT}`);
  console.log(`  Modo: ${ENV}`);
}

export default {
  API_URL,
  LEADS_ENDPOINT,
  LEADS_URL,
  IS_DEV,
  IS_PROD,
  ENV,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION
};
