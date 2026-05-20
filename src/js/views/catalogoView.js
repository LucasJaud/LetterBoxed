// src/js/views/catalogoView.js

export const catalogoView = {
    template: () => `
        <section class="catalogo-painel-filtros">
            <input type="text" class="catalogo-busca-filme" placeholder="Pesquisar título...">
            
            <select class="catalogo-filtro-genero">
                <option value="">Todos os Gêneros</option>
                <option value="Ação">Ação</option>
                <option value="Aventura">Aventura</option>
                <option value="Animação">Animação</option>
                <option value="Comédia">Comédia</option>
                <option value="Crime">Crime</option>
                <option value="Documentário">Documentário</option>
                <option value="Drama">Drama</option>
                <option value="Família">Família</option>
                <option value="Fantasia">Fantasia</option>
                <option value="Ficção Científica">Ficção Científica</option>
                <option value="Terror">Terror</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
            </select>

            <select class="catalogo-filtro-ano">
                <option value="">Ano de Lançamento</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
            </select>

            <button class="catalogo-btn-buscar">Buscar</button>
            <a href="#/perfil" class="catalogo-btn-buscar">Meu Perfil</a>
        </section>

        <section class="catalogo-grid-filmes">
        </section>

        <section class="catalogo-paginacao-container">
            <button class="catalogo-btn-ant" disabled>Anterior</button>
            <span class="catalogo-info-paginas">Página 1</span>
            <button class="catalogo-btn-prox" disabled>Próxima</button>
        </section>
    `,

    init: async (app) => {
        const { initCatalogo } = await import('../app/main.js');
        initCatalogo();
    },

    destroy: () => {}
};
