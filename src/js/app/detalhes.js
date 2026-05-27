import App from '../core/App.js';
import { API_BASE_URL } from '../core/config.js';

export async function initDetalhes() {
    // Carrega o CSS no head para garantir que aplique
    const cssPath = './src/css/detalhes.css';
    const jaExiste = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .some(l => l.getAttribute('href') === cssPath);
    if (!jaExiste) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    }

    // Renderiza a view
    const { detalhesView } = await import('../views/detalhesView.js');
    const appContent = document.querySelector('#app-content');
    if (appContent) {
        appContent.className = 'detalhes-page';
        const hash = window.location.hash;
        const filmeId = hash.split('/')[2];
        appContent.innerHTML = detalhesView.template(filmeId);
    }
    const appHeader = document.querySelector('#app-header');
    if (appHeader) {
        appHeader.className = 'detalhes-header';
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acesso restrito. Faça login para continuar.');
        window.location.href = '/';
        return;
    }

    const estado = App.state({
        titulo: 'Carregando filme...',
        ano: '---',
        genero: '---',
        notaExterna: '---',
        notaInterna: '---',
        diretor: '---',
        roteiristas: '---',
        sinopse: 'Buscando informações no servidor...',
        poster: 'https://via.placeholder.com/350x500',
        notaSelecionada: 0,
        comentario: '',
        temAvaliacao: false,
        modoEdicao: true,
        avaliacoesComunidade: []
    });

    App.bindText('.detalhes-titulo', estado, 'titulo');
    App.bindText('.detalhes-ano', estado, 'ano');
    App.bindText('.detalhes-genero', estado, 'genero');
    App.bindText('.detalhes-nota-externa', estado, 'notaExterna');
    App.bindText('.detalhes-nota-interna', estado, 'notaInterna');
    App.bindText('.detalhes-diretor', estado, 'diretor');
    App.bindText('.detalhes-roteiristas', estado, 'roteiristas');
    App.bindText('.detalhes-sinopse', estado, 'sinopse');

    // Watch para o Poster
    App.watch(() => {
        const posterEl = document.querySelector('.detalhes-poster');
        if (posterEl) {
            posterEl.src = estado.poster;
        }
    });

    // Watch para alternar entre modo edição e exibição
    App.watch(() => {
        const formArea = document.querySelector('.detalhes-area-formulario-avaliacao');
        const exibicaoArea = document.querySelector('.detalhes-minha-avaliacao-exibicao');
        
        if (formArea && exibicaoArea) {
            if (estado.modoEdicao) {
                formArea.classList.remove('detalhes-hidden');
                exibicaoArea.classList.add('detalhes-hidden');
            } else {
                formArea.classList.add('detalhes-hidden');
                exibicaoArea.classList.remove('detalhes-hidden');
            }
        }
    });

    // Watch para atualizar a exibição da minha avaliação
    App.watch(() => {
        const notaDisplay = document.querySelector('.detalhes-minha-nota-display');
        const comentarioDisplay = document.querySelector('.detalhes-meu-comentario-display');
        
        if (notaDisplay) {
            notaDisplay.textContent = '⭐'.repeat(Math.floor(estado.notaSelecionada / 2)) + ` (${estado.notaSelecionada}/10)`;
        }
        if (comentarioDisplay) {
            comentarioDisplay.textContent = estado.comentario || 'Sem comentário.';
        }
    });

    // Lógica das Estrelas
    const starsFg = document.querySelector('.detalhes-stars-gold');
    const hitAreas = document.querySelectorAll('.detalhes-hit-areas div');

    hitAreas.forEach(area => {
        area.addEventListener('click', () => {
            const valor = parseInt(area.getAttribute('data-valor'));
            estado.notaSelecionada = valor;
            atualizarVisualEstrelas(valor);
        });
        area.addEventListener('mouseenter', () => atualizarVisualEstrelas(parseInt(area.getAttribute('data-valor')), true));
    });

    const estrelasContainer = document.querySelector('.detalhes-rating-premium');
    if (estrelasContainer) {
        estrelasContainer.addEventListener('mouseleave', () => atualizarVisualEstrelas(estado.notaSelecionada));
    }

    function atualizarVisualEstrelas(valor, isHover = false) {
        if (starsFg) {
            starsFg.style.width = `${valor * 10}%`;
        }
        const label = document.querySelector('.detalhes-label-nota');
        if (label) {
            const displayValor = isHover ? valor : (estado.notaSelecionada || 0);
            label.textContent = displayValor > 0 ? `Nota: ${displayValor} / 10` : 'Toque nas estrelas para avaliar';
            label.style.color = displayValor > 0 ? '#f5c518' : '#64748b';
        }
    }

    // Bind textarea
    const textarea = document.querySelector('.detalhes-comentario-texto');
    if (textarea) {
        textarea.addEventListener('input', (e) => {
            estado.comentario = e.target.value;
            const charCount = document.querySelector('.detalhes-char-count');
            if (charCount) {
                charCount.textContent = `${e.target.value.length} / 500`;
            }
        });
        // Atualiza o valor do textarea quando o estado muda (ex: ao carregar)
        App.watch(() => {
            if (textarea.value !== estado.comentario) {
                textarea.value = estado.comentario;
                const charCount = document.querySelector('.detalhes-char-count');
                if (charCount) {
                    charCount.textContent = `${estado.comentario.length} / 500`;
                }
            }
        });
    }

    // Ações de Edição
    App.onClick('.detalhes-btn-editar-avaliacao', () => {
        estado.modoEdicao = true;
    });

    App.onClick('.detalhes-btn-cancelar-edicao', () => {
        estado.modoEdicao = false;
    });

    async function carregarDetalhesDoFilme() {
        const hash = window.location.hash;
        const filmeId = hash.split('/')[2];
        if (!filmeId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/filmes/${filmeId}`, {
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
            } else {
                estado.titulo = "Filme não encontrado";
                estado.sinopse = "Não foi possível encontrar o filme solicitado.";
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            estado.titulo = "Erro ao carregar filme";
        }
    }

    async function carregarAvaliacoes(filmeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes/${filmeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                estado.avaliacoesComunidade = data;
                renderizarAvaliacoesComunidade();
            }
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        }
    }

    function renderizarAvaliacoesComunidade() {
        const container = document.querySelector('.detalhes-lista-comentarios');
        if (!container) return;

        if (estado.avaliacoesComunidade.length === 0) {
            container.innerHTML = '<p class="detalhes-msg-vazia">Nenhuma avaliação ainda. Seja o primeiro!</p>';
            return;
        }

        container.innerHTML = estado.avaliacoesComunidade.map(aval => {
            const inicial = aval.usuarioNome ? aval.usuarioNome.charAt(0).toUpperCase() : '?';
            const estrelas = '★'.repeat(Math.floor(aval.nota / 2)) + (aval.nota % 2 ? '½' : '');
            
            return `
                <article class="detalhes-comentario">
                    <div class="detalhes-header-comentario">
                        <div class="detalhes-avatar">${inicial}</div>
                        <div class="detalhes-info-user">
                            <h4>${aval.usuarioNome}</h4>
                            <span class="detalhes-nota-pequena">${estrelas} <small>(${aval.nota}/10)</small></span>
                        </div>
                    </div>
                    <p>${aval.comentario || '<em>Sem comentário.</em>'}</p>
                </article>
            `;
        }).join('');
    }

    async function buscarMinhaAvaliacao(filmeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes/${filmeId}/minha`, {
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
                    
                    const cancelBtn = document.querySelector('.detalhes-btn-cancelar-edicao');
                    if (cancelBtn) cancelBtn.classList.remove('detalhes-hidden');
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
    App.onClick('.detalhes-btn-salvar-avaliacao', async () => {
        const hash = window.location.hash;
        const filmeId = hash.split('/')[2];
        
        if (estado.notaSelecionada === 0) {
            exibirFeedback("Selecione uma nota primeiro!", "detalhes-erro");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes/${filmeId}`, {
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
                exibirFeedback("Avaliação salva!", "detalhes-sucesso");
                estado.temAvaliacao = true;
                estado.modoEdicao = false; // Volta para o modo exibição
                carregarAvaliacoes(filmeId);
                carregarDetalhesDoFilme();
            } else {
                const erro = await response.json();
                exibirFeedback(erro.erro || "Falha ao salvar.", "detalhes-erro");
            }
        } catch (error) {
            exibirFeedback("Erro de conexão.", "detalhes-erro");
        }
    });

    function exibirFeedback(msg, tipo) {
        const el = document.querySelector('.detalhes-feedback-msg');
        if (!el) return;
        el.textContent = msg;
        el.className = `detalhes-feedback-msg ${tipo}`;
        setTimeout(() => { el.className = 'detalhes-feedback-msg'; }, 3000);
    }

    carregarDetalhesDoFilme();
}

App.createPage('#/detalhes', initDetalhes);
