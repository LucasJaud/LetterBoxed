import App from '../core/App.js';

export async function initRegistro() {
    const { registroView } = await import('../views/registroView.js');
    const appContent = document.querySelector('#app-content');
    if (appContent) {
        appContent.className = 'login-page';
        appContent.innerHTML = registroView.template();
    }
    const appHeader = document.querySelector('#app-header');
    if (appHeader) {
        appHeader.className = 'login-header';
    }

    const estado = App.state({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    App.bindInput('.login-input-nome', estado, 'nome');
    App.bindInput('.login-input-email', estado, 'email');
    App.bindInput('.login-input-senha', estado, 'senha');
    App.bindInput('.login-input-confirmar-senha', estado, 'confirmarSenha');

    App.onSubmit('.login-form', async () => {
        const { nome, email, senha, confirmarSenha } = estado;

        if (!nome || !email || !senha || !confirmarSenha) {
            alert('Preencha todos os campos!');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('Senhas não correspondem');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/usuarios/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            if (response.ok) {
                alert('Conta criada! Faça login.');
                window.location.hash = '#/login';
            } else {
                const error = await response.json();
                alert('Erro: ' + (error.erro || error.message));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao criar conta');
        }
    });
}

App.createPage('#/registro', initRegistro);
