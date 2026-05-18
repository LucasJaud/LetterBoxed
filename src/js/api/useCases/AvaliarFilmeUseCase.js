import Avaliacao from "../../entidades/avaliacao.js";
import { AvaliacaoRepositorio } from "../../bd/repositorios/avaliacaoRepositorio.js";
import { FilmeRepositorio } from "../../bd/repositorios/filmeRepositorio.js";

export class AvaliarFilmeUseCase {
    constructor(filmeRepository = new FilmeRepositorio(), avaliacaoRepository = new AvaliacaoRepositorio()) {
        this.filmeRepository = filmeRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    async execute({ userId, filmeId, nota, comentario }) {
        const filme = await this.filmeRepository.buscarPorId(filmeId);

        if (!filme) {
            throw new Error("Filme não encontrado no banco de dados.");
        }

        // Verifica se o usuário já avaliou este filme (Upsert)
        let avaliacao = await this.avaliacaoRepository.buscarPorFilmeEUsuario(filmeId, userId);

        if (avaliacao) {
            avaliacao.editar(nota, comentario);
            await this.avaliacaoRepository.atualizar(avaliacao);
        } else {
            avaliacao = new Avaliacao(null, filmeId, userId, nota, comentario);
            await this.avaliacaoRepository.criar(avaliacao);
        }

        // Busca todas as avaliações do filme para recalcular a nota média
        const todasAvaliacoesRaw = await this.avaliacaoRepository.buscarPorFilme(filmeId);
        
        // Converte os objetos puros do repositório em instâncias da Entidade para usar o método calcularNota()
        const instanciasAvaliacoes = todasAvaliacoesRaw.map(a => new Avaliacao(a.id, a.filmeId, a.usuarioId, a.nota, a.comentario));
        
        filme.avaliacoes = instanciasAvaliacoes;
        filme.calcularNota();

        // Atualiza o filme no banco com a nova nota média
        await this.filmeRepository.atualizar(filme);

        return avaliacao;
    }
}