// src/js/views/detalhesView.js

export const detalhesView = {
    template: (filmeId) => `
        <section class="detalhes-container">
            <a href="#/catalogo" class="detalhes-btn-voltar">← Voltar</a>
            
            <section class="detalhes-area-poster">
                <img class="detalhes-poster" src="https://via.placeholder.com/350x500" alt="Poster do Filme">
            </section>

            <section class="detalhes-area-info">
                <h2 class="detalhes-titulo">Carregando filme...</h2>

                <div class="detalhes-informacoes-filme">
                    <p><strong>Ano:</strong> <span class="detalhes-ano">---</span></p>
                    <p><strong>Gênero:</strong> <span class="detalhes-genero">---</span></p>
                    <p><strong>Nota TMDB:</strong> ⭐ <span class="detalhes-nota-externa">---</span> / 10</p>
                    <p><strong>Nota LetterBoxed:</strong> ⭐ <span class="detalhes-nota-interna">---</span> / 10</p>
                    <p><strong>Diretor:</strong> <span class="detalhes-diretor">---</span></p>
                    <p><strong>Roteiristas:</strong> <span class="detalhes-roteiristas">---</span></p>
                </div>

                <div class="detalhes-descricao-filme">
                    <h3>Sinopse</h3>
                    <p class="detalhes-sinopse">
                        Buscando informações no servidor...
                    </p>
                </div>

                <div class="detalhes-avaliacao-usuario">
                    <div class="detalhes-minha-avaliacao-exibicao detalhes-hidden">
                        <div class="detalhes-header-minha-aval">
                            <h3>Sua Avaliação</h3>
                            <button class="detalhes-btn-editar-avaliacao detalhes-btn-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#f5c518"/></svg>
                            </button>
                        </div>
                        <div class="detalhes-content-minha-aval">
                            <div class="detalhes-minha-nota-display detalhes-nota-exibicao"></div>
                            <p class="detalhes-meu-comentario-display"></p>
                        </div>
                    </div>

                    <div class="detalhes-area-formulario-avaliacao">
                        <h3>Sua Avaliação</h3>
                        <div class="detalhes-rating-premium">
                            <div class="detalhes-stars-base">
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </div>
                            <div class="detalhes-stars-gold">
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </div>
                            <div class="detalhes-hit-areas">
                                <div data-valor="1"></div><div data-valor="2"></div>
                                <div data-valor="3"></div><div data-valor="4"></div>
                                <div data-valor="5"></div><div data-valor="6"></div>
                                <div data-valor="7"></div><div data-valor="8"></div>
                                <div data-valor="9"></div><div data-valor="10"></div>
                            </div>
                        </div>
                        <p class="detalhes-label-nota">Toque nas estrelas para avaliar</p>
                        
                        <div class="detalhes-textarea-container">
                            <textarea class="detalhes-comentario-texto" placeholder="Escreva sua opinião sobre o filme (opcional)..." maxlength="500"></textarea>
                            <span class="detalhes-char-count">0 / 500</span>
                        </div>
                        <div class="detalhes-acoes-avaliacao">
                            <button class="detalhes-btn-salvar-avaliacao detalhes-btn-avaliar">Salvar Avaliação</button>
                            <button class="detalhes-btn-cancelar-edicao detalhes-btn-cancelar detalhes-hidden">Cancelar</button>
                            <span class="detalhes-feedback-msg"></span>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        <section class="detalhes-comentarios-container">
            <h3>Avaliações da Comunidade</h3>
            <div class="detalhes-lista-comentarios">
                <!-- Populada via JS -->
                <p class="detalhes-msg-vazia">Nenhuma avaliação ainda. Seja o primeiro!</p>
            </div>
        </section>
    `,

    init: async (app, filmeId) => {},

    destroy: () => {}
};
