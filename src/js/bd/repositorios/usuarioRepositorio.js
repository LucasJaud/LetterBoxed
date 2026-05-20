import { Usuario as UsuarioModel } from '../../models/index.js';

export class UsuarioRepositorio {
    async buscarPorId(id) {
        return await UsuarioModel.findByPk(id);
    }

    async buscarPorEmail(email) {
        return await UsuarioModel.findOne({ where: { email } });
    }

    async criar(usuario) {
        const usuarioExistente = await this.buscarPorEmail(usuario.email);
        if (usuarioExistente) {
            throw new Error("Impossível criar. O e-mail do usuário já existe no banco de dados.");
        }

        const criado = await UsuarioModel.create({
            nome: usuario.nome,
            email: usuario.email,
            senha: usuario.senha
        });

        usuario.id = criado.id;
        usuario.dataCadastro = criado.createdAt;
        return usuario;
    }

    async atualizar(usuario) {
        const usuarioExiste = await UsuarioModel.findByPk(usuario.id);

        if (!usuarioExiste) {
            throw new Error("Impossível atualizar. O usuário não foi encontrado no banco.");
        }

        await UsuarioModel.update({
            nome: usuario.nome,
            email: usuario.email,
            senha: usuario.senha
        }, {
            where: { id: usuario.id }
        });

        return usuario;
    }
}
