// src/js/core/config.js
// Centraliza a URL do backend para facilitar a mudança entre ambiente local e produção no Render.

export const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    
    // Se estiver rodando localmente
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // Se estiver no Render, tenta resolver automaticamente:
    // Se o frontend se chamar "meu-projeto-web.onrender.com",
    // o backend correspondente na blueprint será "meu-projeto-api.onrender.com".
    if (hostname.includes('onrender.com')) {
        return `https://${hostname.replace('-web', '-api')}`;
    }
    
    // Fallback caso usem outros domínios ou nomes customizados
    // (O usuário pode ajustar esta string para o endereço correto do backend se necessário)
    return 'https://letterboxed-api.onrender.com';
})();

console.log(`[Config] API Base URL configurada como: ${API_BASE_URL}`);
