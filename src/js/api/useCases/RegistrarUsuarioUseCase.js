export class RegistrarUsuarioUseCase {
    // Aplicando Inversão de Dependência injetando o Repositório de Usuários
    constructor(usuarioRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
    }

    async execute({ nome, email, senha }) {
        if (!nome || !email || !senha) {
            throw new Error("Nome, e-mail e senha são obrigatórios.");
        }

        // Delega para o repositório a criação segura (o repositório já valida duplicidade de e-mail)
        const novoUsuario = await this.usuarioRepositorio.criar({
            nome,
            email,
            senha,
            dataCadastro: new Date().toISOString()
        });

        // Retorna o objeto limpo para o controller (sem a senha)
        return {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            dataCadastro: novoUsuario.dataCadastro
        };
    }
}
