// ==========================================
// main.js — Página do Catálogo de Filmes
// Refatorado para usar o mini framework reativo com Paginação e Filtros
// ==========================================

import App from '../core/App.js';
import { configurarNav } from './nav.js';

// ==========================================
// LÓGICA DA PÁGINA DO CATÁLOGO
// ==========================================

export async function initCatalogo() {
    // Carrega o CSS no head para garantir que aplique
    const cssPath = './src/css/catalogo.css';
    const jaExiste = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .some(l => l.getAttribute('href') === cssPath);
    if (!jaExiste) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    }

    // Renderiza a view do catálogo
    const { catalogoView } = await import('../views/catalogoView.js');
    const appContent = document.querySelector('#app-content');
    if (appContent) {
        appContent.className = 'catalogo-page';
        appContent.innerHTML = catalogoView.template();
    }
    configurarNav('catalogo');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acesso restrito. Faça login para continuar.');
        window.location.href = '/';
        return;
    }

    let paginaAtual = 1;
    let totalPaginas = 1;
    let debounceTimer = null;
    let abortController = null;
    const DEBOUNCE_MS = 250;

    const gridContainer = document.querySelector('.catalogo-grid-filmes');
    const inputBusca = document.querySelector('.catalogo-busca-filme');
    const selectGenero = document.querySelector('.catalogo-filtro-genero');
    const selectAno = document.querySelector('.catalogo-filtro-ano');

    // ==========================================
    // ESTADO REATIVO
    // ==========================================

    const estado = App.state({
        filmes: [],
        titulo: '',
        genero: '',
        ano: '',
        carregando: false,
        erro: null
    });

    // ==========================================
    // RENDER DO GRID
    // ==========================================

    let ultimosIdsFilmes = '';

    function atualizarIndicadorCarregando() {
        gridContainer?.classList.toggle('catalogo-carregando', estado.carregando);
    }

    function atualizarGrid() {
        if (!gridContainer) return;

        const lista = estado.filmes;
        if (!lista?.length) {
            if (!estado.carregando) {
                gridContainer.innerHTML = '<p class="catalogo-msg-vazia">Nenhum filme encontrado.</p>';
                ultimosIdsFilmes = '';
            }
            return;
        }

        const ids = lista.map(f => f.id).join(',');
        if (ids === ultimosIdsFilmes) return;

        ultimosIdsFilmes = ids;
        gridContainer.innerHTML = lista.map(renderizarCard).join('');
    }

    App.watch(() => {
        estado.carregando;
        atualizarIndicadorCarregando();
    });

    App.watch(() => {
        estado.filmes;
        atualizarGrid();
    });

    // ==========================================
    // EVENTOS
    // ==========================================

    function executarBusca() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        paginaAtual = 1;
        buscarFilmes(paginaAtual);
    }

    function agendarBuscaTitulo() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(executarBusca, DEBOUNCE_MS);
    }

    inputBusca?.addEventListener('input', () => {
        estado.titulo = inputBusca.value;
        agendarBuscaTitulo();
    });

    selectGenero?.addEventListener('change', () => {
        estado.genero = selectGenero.value;
        executarBusca();
    });

    selectAno?.addEventListener('change', () => {
        estado.ano = selectAno.value;
        executarBusca();
    });

    App.onClick('button.catalogo-btn-buscar', () => {
        executarBusca();
    });

    App.onClick('.catalogo-btn-ant', (e) => {
        e.preventDefault();
        if (paginaAtual > 1) {
            paginaAtual--;
            buscarFilmes(paginaAtual);
        }
    });

    App.onClick('.catalogo-btn-prox', (e) => {
        e.preventDefault();
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            buscarFilmes(paginaAtual);
        }
    });

    // ==========================================
    // LÓGICA DE NEGÓCIO
    // ==========================================

    async function buscarFilmes(pagina = 1) {
        if (abortController) {
            abortController.abort();
        }
        abortController = new AbortController();

        try {
            estado.carregando = true;

            const titulo = estado.titulo.trim();
            const genero = estado.genero;
            const ano = estado.ano;

            const params = new URLSearchParams({ pagina, genero, ano, titulo }).toString();
            const url = `http://localhost:3000/filmes?${params}`;

            const response = await fetch(url, {
                signal: abortController.signal,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Servidor não respondeu OK. Status: ${response.status}`);
            }

            const data = await response.json();

            estado.filmes = data.filmes || [];
            paginaAtual = data.paginaCorrente || 1;
            totalPaginas = data.totalPaginas || 1;

            const info = document.querySelector('.catalogo-info-paginas');
            if (info) {
                info.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
            }

            const btnAnt = document.querySelector('.catalogo-btn-ant');
            if (btnAnt) {
                btnAnt.disabled = paginaAtual <= 1;
            }

            const btnProx = document.querySelector('.catalogo-btn-prox');
            if (btnProx) {
                btnProx.disabled = paginaAtual >= totalPaginas;
            }

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('[main.js] Erro de requisição:', error);
            if (gridContainer) {
                gridContainer.innerHTML = '<p class="catalogo-msg-erro">Erro ao buscar filmes. Tente novamente.</p>';
            }
        } finally {
            estado.carregando = false;
        }
    }

    // ==========================================
    // RENDERIZAÇÃO (como desenhar cada card)
    // ==========================================

    function renderizarCard(filme) {
        const posterHtm = filme.poster
            ? `<img src="${filme.poster}" alt="Pôster de ${filme.titulo}" class="catalogo-poster-filme" loading="lazy" decoding="async">`
            : `<div class="catalogo-poster-vazio">Sem Pôster</div>`;

        const diretorHtml = filme.diretor
            ? `<p><em>${filme.diretor}</em></p>`
            : '';

        return `
            <article class="catalogo-card-filme">
                <a href="#/detalhes/${filme.id}" style="text-decoration: none; color: inherit;">
                    ${posterHtm}
                    <h3>${filme.titulo} (${filme.ano})</h3>
                </a>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Nota TMDB:</strong> ⭐ ${filme.nota ? filme.nota.toFixed(1) : 0} / 10</p>
                <p><strong>Nota do Site:</strong> ⭐ ${filme.notaPlataforma ? filme.notaPlataforma.toFixed(1) : 0} / 10</p>
                ${diretorHtml}
                <div class="catalogo-acoes-card" style="margin-top: auto; padding: 15px;">
                    <a href="#/detalhes/${filme.id}" class="catalogo-btn-avaliar" style="text-decoration: none; display: block; text-align: center; color: #000;">Ver Detalhes</a>
                </div>
            </article>
        `;
    }

    // Inicia a primeira busca
    buscarFilmes(1);
}

// ==========================================
// REGISTRO DA PÁGINA NO FRAMEWORK
// ==========================================

App.createPage('#/catalogo', initCatalogo);

// Compatibilidade para acesso direto
if (window.location.pathname.includes('catalogo')) {
    App.createPage(window.location.pathname, initCatalogo);
    App.start();
}
