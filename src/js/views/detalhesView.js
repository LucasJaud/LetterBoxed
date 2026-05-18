// src/js/views/detalhesView.js

export const detalhesView = {
    template: (filmeId) => `
        <section class="detalhes-container">
            <a href="#/catalogo" class="detalhes-btn-voltar">← Voltar</a>
            <section class="detalhes-area-poster">
                <img class="detalhes-poster" src="https://via.placeholder.com/350x500" alt="Poster">
            </section>
            <section class="detalhes-area-info">
                <h2 class="detalhes-titulo">Carregando...</h2>
                <div class="detalhes-informacoes-filme">
                    <p><strong>Ano:</strong> <span class="detalhes-ano">-</span></p>
                    <p><strong>Gênero:</strong> <span class="detalhes-genero">-</span></p>
                    <p><strong>Nota TMDB:</strong> <span class="detalhes-nota">-</span></p>
                    <p><strong>Diretor:</strong> <span class="detalhes-diretor">-</span></p>
                </div>
                <div class="detalhes-descricao-filme">
                    <h3>Sinopse</h3>
                    <p class="detalhes-sinopse">-</p>
                </div>
                <div class="detalhes-avaliacao-usuario">
                    <h3>Sua Avaliação</h3>
                    <div class="detalhes-estrelas"></div>
                    <textarea class="detalhes-resenha" placeholder="Escreva sua resenha..."></textarea>
                    <button class="detalhes-btn-avaliar">Salvar Avaliação</button>
                </div>
            </section>
        </section>
    `,

    init: async (app, filmeId) => {},

    destroy: () => {}
};
