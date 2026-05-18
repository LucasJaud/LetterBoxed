import { Avaliacao as AvaliacaoModel, Usuario as UsuarioModel } from '../../models/index.js';
import Avaliacao from '../../entidades/avaliacao.js';

export class AvaliacaoRepositorio {
    async buscarPorId(id) {
        const data = await AvaliacaoModel.findByPk(id);
        if (!data) return null;

        return new Avaliacao(
            data.id,
            data.filmeId,
            data.usuarioId,
            data.nota,
            data.comentario
        );
    }

    async buscarPorFilme(filmeId) {
        const data = await AvaliacaoModel.findAll({
            where: { filmeId },
            include: [{ model: UsuarioModel, as: 'usuario', attributes: ['id', 'nome'] }]
        });

        return data.map(a => ({
            id: a.id,
            filmeId: a.filmeId,
            usuarioId: a.usuarioId,
            nota: a.nota,
            comentario: a.comentario,
            usuarioNome: a.usuario ? a.usuario.nome : 'Anônimo'
        }));
    }

    async buscarPorFilmeEUsuario(filmeId, usuarioId) {
        const data = await AvaliacaoModel.findOne({
            where: { filmeId, usuarioId }
        });

        if (!data) return null;

        return new Avaliacao(
            data.id,
            data.filmeId,
            data.usuarioId,
            data.nota,
            data.comentario
        );
    }

    async criar(avaliacao) {
        const data = await AvaliacaoModel.create({
            filmeId: avaliacao.filmeId,
            usuarioId: avaliacao.usuarioId,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario
        });

        avaliacao.id = data.id;
        return avaliacao;
    }

    async atualizar(avaliacao) {
        await AvaliacaoModel.update({
            nota: avaliacao.nota,
            comentario: avaliacao.comentario
        }, {
            where: { id: avaliacao.id }
        });

        return avaliacao;
    }
}
