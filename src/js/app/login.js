// ==========================================
// login.js — Bootstrap da aplicação + Lógica de Login
// Este script roda no index.html (carregado com defer, sem type="module")
// Por isso usamos import() dinâmico para carregar os módulos do framework.
// 
// ⚠️ SPA - IMPORTANTE PARA MARCOS E GABRIEL:
// Este projeto usa Single Page Application (SPA).
// TODO funciona a partir do index.html. Os arquivos em src/pages/
// são mantidos APENAS COMO REFERÊNCIA VISUAL e não são utilizados.
// Foco: index.html + views renderizadas em JavaScript via roteador hash.
// ==========================================

(async function bootstrap() {
    // Carrega o mini framework dinamicamente (necessário pois o HTML não tem type="module")
    const { default: App } = await import('../core/App.js');

    // ==========================================
    // PÁGINA DE LOGIN (index.html)
    // ==========================================

    async function initLogin() {
        // Carrega a view de login
        const { loginView } = await import('../views/loginView.js');
        const appContent = document.querySelector('#app-content');
        if (appContent) {
            appContent.className = 'login-page';
            appContent.innerHTML = loginView.template();
        }
        const appHeader = document.querySelector('#app-header');
        if (appHeader) {
            appHeader.className = 'login-header';
        }

        // Cria o estado reativo para os campos do formulário
        const estado = App.state({
            usuario: '',
            senha: ''
        });

        // Conecta os inputs ao estado (ponte bidirecional)
        App.bindInput('.login-input-usuario', estado, 'usuario');
        App.bindInput('.login-input-senha', estado, 'senha');

        // Intercepta a submissão do formulário de login.
        App.onSubmit('.login-form', async (evento) => {
            const { usuario, senha } = estado;

            if (!usuario || !senha) {
                alert('Preencha todos os campos!');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: usuario, senha })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    window.location.hash = '#/catalogo';
                } else {
                    alert('Credenciais inválidas');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao fazer login');
            }
        });
    }

    // Registra a página de login no framework
    App.createPage('#/login', initLogin);

    // Redireciona para o login se estiver na raiz
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/login';
    }

    // ==========================================
    // REGISTRO DE OUTRAS PÁGINAS
    // ==========================================

    // Importa e registra a página do catálogo
    await import('./main.js');
    await import('./detalhes.js');

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    // Inicia o mini framework (ativa o roteador e dispara os hooks)
    App.start();
})();
