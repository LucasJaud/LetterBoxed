export class LoginUseCase {
    constructor(usuarioRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
    }

    async execute({ email, senha }) {
        if (!email || !senha) {
            throw new Error("O E-mail e a senha são obrigatórios.");
        }

        const usuarioLocalizado = await this.usuarioRepositorio.buscarPorEmail(email);

        if (!usuarioLocalizado) {
            throw new Error("E-mail ou senha incorretos.");
        }

        const senhaBate = await usuarioLocalizado.checarSenha(senha);

        if (!senhaBate) {
            throw new Error("E-mail ou senha incorretos.");
        }

        return {
            id: usuarioLocalizado.id,
            nome: usuarioLocalizado.nome,
            email: usuarioLocalizado.email
        };
    }
}
