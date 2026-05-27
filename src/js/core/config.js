// src/js/core/config.js
// Centraliza a URL do backend para facilitar a mudança entre ambiente local e produção no Render.

export const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    
    // Se estiver rodando localmente
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // URL de produção do seu backend no Render (com o sufixo exclusivo gerado pelo Render)
    return 'https://letterboxed-api-kb48.onrender.com';
})();

console.log(`[Config] API Base URL configurada como: ${API_BASE_URL}`);
