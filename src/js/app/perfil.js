import App from '../core/App.js';
import { configurarNav } from './nav.js';

export async function initPerfil() {
    const { perfilView } = await import('../views/perfilView.js');
    const appContent = document.querySelector('#app-content');
    if (appContent) {
        appContent.className = 'perfil-page';
        appContent.innerHTML = perfilView.template();
    }
    configurarNav('perfil');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acesso restrito. Faça login para continuar.');
        window.location.href = '/';
        return;
    }

    const estado = App.state({
        nome: 'Carregando...',
        email: '-',
        totalFilmes: '0',
        mediaNota: '0',
        filmes: [],
        erro: null
    });

    App.bindText('.perfil-nome-usuario', estado, 'nome');
    App.bindText('.perfil-email-usuario', estado, 'email');
    App.bindText('.perfil-total-filmes', estado, 'totalFilmes');
    App.bindText('.perfil-media-avaliacao', estado, 'mediaNota');

    App.bindList('.perfil-grid-filmes', estado, 'filmes', renderizarCard);

    async function carregarPerfil() {
        try {
            const response = await fetch('http://localhost:3000/usuarios/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const perfil = await response.json();

            estado.nome = perfil.nome;
            estado.email = perfil.email;
            estado.totalFilmes = String(perfil.totalFilmes || 0);
            estado.mediaNota = (perfil.mediaNota || 0).toFixed(1);
            estado.filmes = perfil.filmes || [];

            localStorage.setItem('usuario', JSON.stringify({
                id: perfil.id,
                nome: perfil.nome,
                email: perfil.email
            }));
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            estado.erro = error.message;
            estado.nome = 'Erro ao carregar';
            estado.email = '-';
        }
    }

    function renderizarCard(filme) {
        const posterHtml = filme.poster
            ? `<img src="${filme.poster}" alt="Pôster de ${filme.titulo}" class="catalogo-poster-filme">`
            : `<div class="catalogo-poster-vazio">Sem Pôster</div>`;

        return `
            <article class="catalogo-card-filme">
                <a href="#/detalhes/${filme.id}" style="text-decoration: none; color: inherit;">
                    ${posterHtml}
                    <h3>${filme.titulo} (${filme.ano})</h3>
                </a>
                <p><strong>Gênero:</strong> ${filme.genero || '-'}</p>
                <p><strong>Sua nota:</strong> ⭐ ${filme.notaUsuario != null ? filme.notaUsuario.toFixed(1) : '-'} / 10</p>
            </article>
        `;
    }

    carregarPerfil();
}

App.createPage('#/perfil', initPerfil);
