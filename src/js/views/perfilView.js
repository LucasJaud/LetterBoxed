// src/js/views/perfilView.js

export const perfilView = {
    template: () => `
        <section class="container-perfil">
            <div class="info-usuario">
                <img class="perfil-foto-usuario" src="https://via.placeholder.com/100" alt="Foto">
                <div>
                    <h2 class="perfil-nome-usuario">Carregando...</h2>
                    <p class="perfil-email-usuario">-</p>
                </div>
            </div>
            <section class="stats-usuario">
                <div class="stat-item">
                    <span class="stat-numero perfil-total-filmes">0</span>
                    <span class="stat-label">Filmes Assistidos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-numero perfil-media-avaliacao">0</span>
                    <span class="stat-label">Nota Média</span>
                </div>
            </section>
            <section class="filmes-usuario">
                <h2>Filmes Avaliados</h2>
                <div class="perfil-grid-filmes grid-filmes"></div>
            </section>
        </section>
    `,

    init: async (app) => {
        const { initPerfil } = await import('../app/perfil.js');
        initPerfil();
    },

    destroy: () => {}
};
