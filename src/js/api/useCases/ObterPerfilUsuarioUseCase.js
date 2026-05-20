import { UsuarioRepositorio } from '../../bd/repositorios/usuarioRepositorio.js';
import { AvaliacaoRepositorio } from '../../bd/repositorios/avaliacaoRepositorio.js';
import { FilmeRepositorio } from '../../bd/repositorios/filmeRepositorio.js';

export class ObterPerfilUsuarioUseCase {
    constructor(
        usuarioRepositorio = new UsuarioRepositorio(),
        avaliacaoRepositorio = new AvaliacaoRepositorio(),
        filmeRepositorio = new FilmeRepositorio()
    ) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.avaliacaoRepositorio = avaliacaoRepositorio;
        this.filmeRepositorio = filmeRepositorio;
    }

    async execute(usuarioId) {
        const usuario = await this.usuarioRepositorio.buscarPorId(usuarioId);

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        const avaliacoes = await this.avaliacaoRepositorio.buscarPorUsuario(usuarioId);
        const filmeIds = [...new Set(avaliacoes.map(a => a.filmeId))];
        const filmes = await this.filmeRepositorio.buscarPorIds(filmeIds);

        const totalFilmes = avaliacoes.length;
        const mediaNota = totalFilmes > 0
            ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / totalFilmes
            : 0;

        const filmesAvaliados = filmes.map(filme => {
            const avaliacao = avaliacoes.find(a => a.filmeId === filme.id);
            return {
                id: filme.id,
                titulo: filme.titulo,
                ano: filme.ano,
                genero: filme.genero,
                poster: filme.poster,
                notaUsuario: avaliacao ? avaliacao.nota : null,
                comentario: avaliacao ? avaliacao.comentario : null
            };
        }).sort((a, b) => (b.notaUsuario || 0) - (a.notaUsuario || 0));

        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            dataCadastro: usuario.createdAt,
            totalFilmes,
            mediaNota,
            filmes: filmesAvaliados
        };
    }
}
