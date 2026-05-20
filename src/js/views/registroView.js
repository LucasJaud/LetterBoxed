// src/js/views/registroView.js

export const registroView = {
    template: () => `
        <section class="login-container">
            <h2>Criar Conta</h2>
            <form class="login-form" onsubmit="event.preventDefault();">
                <div class="login-grupo-input">
                    <input type="text" id="nome" class="login-input-nome" name="nome" required>
                    <label for="nome">Nome Completo:</label>
                </div>
                <div class="login-grupo-input">
                    <input type="email" id="email" class="login-input-email" name="email" required>
                    <label for="email">E-mail:</label>
                </div>
                <div class="login-grupo-input">
                    <input type="password" id="senha" class="login-input-senha" name="senha" required>
                    <label for="senha">Senha:</label>
                </div>
                <div class="login-grupo-input">
                    <input type="password" id="confirmar-senha" class="login-input-confirmar-senha" name="confirmar-senha" required>
                    <label for="confirmar-senha">Confirmar Senha:</label>
                </div>
                <button type="submit" class="login-btn-entrar">Cadastrar</button>
            </form>
            <p>Já possui conta? <a href="#/login" class="login-link-login">Faça o login</a></p>
        </section>
    `,

    init: async (app) => {},

    destroy: () => {}
};
