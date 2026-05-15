import App from '../core/App.js';

function initDetalhes() {
    const token = localStorage.getItem('token');
    const usuarioLogadoStr = localStorage.getItem('usuario');
    const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

    if (!token || !usuarioLogado) {
        alert('Acesso restrito. Faça login para continuar.');
        window.location.href = '/';
        return;
    }

    const estado = App.state({
        titulo: 'Carregando filme...',
        ano: '---',
        genero: '---',
        notaInterna: '---',
        notaExterna: '---',
        diretor: '---',
        roteiristas: '---',
        sinopse: 'Buscando informações no servidor...',
        poster: 'https://via.placeholder.com/350x500',
        // Estados da Avaliação
        notaSelecionada: 0,
        comentario: '',
        modoEdicao: true, // Começa em modo edição se não tiver avaliação
        temAvaliacao: false,
        avaliacoesComunidade: []
    });

    // Bindings básicos
    App.bindText('#detalhes-titulo', estado, 'titulo');
    App.bindText('#detalhes-ano', estado, 'ano');
    App.bindText('#detalhes-genero', estado, 'genero');
    App.bindText('#detalhes-nota-interna', estado, 'notaInterna');
    App.bindText('#detalhes-nota-externa', estado, 'notaExterna');
    App.bindText('#detalhes-diretor', estado, 'diretor');
    App.bindText('#detalhes-roteiristas', estado, 'roteiristas');
    App.bindText('#detalhes-sinopse', estado, 'sinopse');

    // Binding do comentário (textarea)
    App.bindInput('#comentario-texto', estado, 'comentario');

    // Watcher de visibilidade dos modos
    App.watch(() => {
        const areaExibicao = document.getElementById('minha-avaliacao-exibicao');
        const areaForm = document.getElementById('area-formulario-avaliacao');
        const btnCancelar = document.getElementById('btn-cancelar-edicao');

        if (estado.modoEdicao) {
            areaExibicao.classList.add('hidden');
            areaForm.classList.remove('hidden');
            // Só mostra cancelar se já tiver uma avaliação anterior
            if (estado.temAvaliacao) btnCancelar.classList.remove('hidden');
            else btnCancelar.classList.add('hidden');
        } else {
            areaExibicao.classList.remove('hidden');
            areaForm.classList.add('hidden');

            // Atualiza os campos de exibição
            const notaDisplay = document.getElementById('minha-nota-display');
            const comentarioDisplay = document.getElementById('meu-comentario-display');
            if (notaDisplay) {
                const estrelas = '★'.repeat(Math.floor(estado.notaSelecionada / 2)) + (estado.notaSelecionada % 2 ? '½' : '');
                notaDisplay.textContent = `${estrelas} (${estado.notaSelecionada}/10)`;
            }
            if (comentarioDisplay) {
                comentarioDisplay.textContent = estado.comentario || 'Você não deixou comentários nesta avaliação.';
                comentarioDisplay.style.fontStyle = estado.comentario ? 'normal' : 'italic';
            }
        }
    });

    // Watch para o contador de caracteres
    App.watch(() => {
        const charCountEl = document.getElementById('char-count');
        if (charCountEl) {
            charCountEl.textContent = `${estado.comentario.length} / 500`;
            charCountEl.style.color = estado.comentario.length >= 450 ? '#ef4444' : '#475569';
        }
    });

    // Binding da lista de avaliações da comunidade (filtrada)
    App.bindList('#lista-avaliacoes', estado, 'avaliacoesComunidade', (aval) => {
        // Pula se for a avaliação do próprio usuário logado (já mostrada acima)
        if (aval.usuarioId == usuarioLogado.id) return '';

        const inicial = aval.usuarioNome.charAt(0).toUpperCase();
        const corAvatar = gerarCorAvatar(aval.usuarioNome);
        const estrelas = '★'.repeat(Math.floor(aval.nota / 2)) + (aval.nota % 2 ? '½' : '');

        return `
            <article class="comentario">
                <div class="header-comentario">
                    <div class="avatar" style="background: ${corAvatar}">${inicial}</div>
                    <div class="info-user">
                        <h4>${aval.usuarioNome}</h4>
                        <span class="nota-pequena">${estrelas} <small>(${aval.nota}/10)</small></span>
                    </div>
                </div>
                <p>${aval.comentario || '<em>Sem comentário.</em>'}</p>
            </article>
        `;
    });

    function gerarCorAvatar(nome) {
        const cores = [
            'linear-gradient(135deg, #3b82f6, #2563eb)',
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #ef4444, #dc2626)',
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'linear-gradient(135deg, #ec4899, #db2777)'
        ];
        let hash = 0;
        for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        return cores[Math.abs(hash) % cores.length];
    }

    // Lógica das Estrelas Premium
    const starsFg = document.getElementById('stars-fg');
    const hitAreas = document.querySelectorAll('.hit-areas div');

    hitAreas.forEach(area => {
        area.addEventListener('click', () => {
            const valor = parseInt(area.getAttribute('data-valor'));
            estado.notaSelecionada = valor;
            atualizarVisualEstrelas(valor);
        });
        area.addEventListener('mouseenter', () => atualizarVisualEstrelas(parseInt(area.getAttribute('data-valor')), true));
    });

    document.getElementById('estrelas-container').addEventListener('mouseleave', () => atualizarVisualEstrelas(estado.notaSelecionada));

    function atualizarVisualEstrelas(valor, isHover = false) {
        if (starsFg) {
            starsFg.style.width = `${valor * 10}%`;
            starsFg.style.filter = isHover ? 'brightness(1.2) drop-shadow(0 0 12px rgba(245, 197, 24, 0.6))' : 'brightness(1) drop-shadow(0 0 8px rgba(245, 197, 24, 0.4))';
        }
        const label = document.getElementById('label-nota');
        if (label) {
            const displayValor = isHover ? valor : (estado.notaSelecionada || 0);
            label.textContent = displayValor > 0 ? `Nota: ${displayValor} / 10` : 'Toque nas estrelas para avaliar';
            label.style.color = displayValor > 0 ? '#f5c518' : '#64748b';
        }
    }

    // Ações de Edição
    App.onClick('#btn-editar-avaliacao', () => {
        estado.modoEdicao = true;
    });

    App.onClick('#btn-cancelar-edicao', () => {
        estado.modoEdicao = false;
    });

    // Logout
    App.onClick('a[href*="index.html"]', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
    });

    // Watch para o Poster
    App.watch(() => {
        const posterEl = document.getElementById('detalhes-poster');
        if (posterEl) posterEl.src = estado.poster;
    });

    async function carregarDetalhesDoFilme() {
        const urlParams = new URLSearchParams(window.location.search);
        const filmeId = urlParams.get('id');
        if (!filmeId) return;

        try {
            const response = await fetch(`http://localhost:3000/filmes/${filmeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const filme = await response.json();
            if (filme) {
                estado.titulo = filme.titulo;
                estado.sinopse = filme.sinopse;
                estado.poster = filme.poster;
                estado.ano = filme.ano;
                estado.genero = filme.genero;
                estado.notaExterna = (filme.nota !== undefined && filme.nota !== null) ? filme.nota.toFixed(1) : '0.0';
                estado.notaInterna = (filme.notaPlataforma !== undefined && filme.notaPlataforma !== null && filme.notaPlataforma > 0) ? filme.notaPlataforma.toFixed(1) : 'Sem avaliações';
                estado.diretor = filme.diretor;
                estado.roteiristas = filme.roteiristas || '---';

                carregarAvaliacoes(filmeId);
                buscarMinhaAvaliacao(filmeId);
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            estado.titulo = "Erro ao carregar filme";
        }
    }

    async function carregarAvaliacoes(filmeId) {
        try {
            const response = await fetch(`http://localhost:3000/avaliacoes/${filmeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                estado.avaliacoesComunidade = data;
            }
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        }
    }

    async function buscarMinhaAvaliacao(filmeId) {
        try {
            const response = await fetch(`http://localhost:3000/avaliacoes/${filmeId}/minha`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const aval = await response.json();
                if (aval) {
                    estado.notaSelecionada = aval.nota;
                    estado.comentario = aval.comentario || '';
                    estado.temAvaliacao = true;
                    estado.modoEdicao = false; // Mostra o modo exibição
                    atualizarVisualEstrelas(aval.nota);
                } else {
                    estado.temAvaliacao = false;
                    estado.modoEdicao = true; // Mostra o formulário
                }
            }
        } catch (error) {
            console.error("Erro ao buscar minha avaliação:", error);
        }
    }

    // Botão Salvar Avaliação
    App.onClick('#btn-salvar-avaliacao', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const filmeId = urlParams.get('id');
        if (estado.notaSelecionada === 0) {
            exibirFeedback("Selecione uma nota primeiro!", "erro");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/avaliacoes/${filmeId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nota: estado.notaSelecionada,
                    comentario: estado.comentario
                })
            });

            if (response.ok) {
                exibirFeedback("Avaliação salva!", "sucesso");
                estado.temAvaliacao = true;
                estado.modoEdicao = false; // Volta para o modo exibição
                carregarAvaliacoes(filmeId);
                carregarDetalhesDoFilme();
            } else {
                const erro = await response.json();
                exibirFeedback(erro.erro || "Falha ao salvar.", "erro");
            }
        } catch (error) {
            exibirFeedback("Erro de conexão.", "erro");
        }
    });

    function exibirFeedback(msg, tipo) {
        const el = document.getElementById('feedback-msg');
        if (!el) return;
        el.textContent = msg;
        el.className = tipo;
        setTimeout(() => { el.className = ''; }, 3000);
    }

    carregarDetalhesDoFilme();
}

App.createPage('/detalhes.html', initDetalhes);
App.createPage('/detalhes', initDetalhes);
App.createPage('/src/detalhes.html', initDetalhes);

if (window.location.pathname.includes('detalhes')) App.start();
