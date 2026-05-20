// src/js/views/loginView.js

export const loginView = {
    template: () => `
        <section class="login-container">
            <h2>Fazer Login</h2>
            <form id="form-login" class="login-form" onsubmit="event.preventDefault();">
                <div class="login-grupo-input">
                    <input type="text" id="usuario" class="login-input-usuario" name="usuario" required>
                    <label for="usuario">Usuário ou E-mail:</label>
                </div>
                <div class="login-grupo-input">
                    <input type="password" id="senha" class="login-input-senha" name="senha" required>
                    <label for="senha">Senha:</label>
                </div>
                <button type="submit" class="login-btn-entrar">Entrar</button>
            </form>
            <p>Não tem conta? <a href="#/registro" class="login-link-registro">Criar Conta</a></p>
        </section>
    `,

    init: async (app) => {},

    destroy: () => {}
};
