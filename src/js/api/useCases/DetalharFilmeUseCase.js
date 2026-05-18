import { FilmeRepositorio } from '../../bd/repositorios/filmeRepositorio.js';

export class DetalharFilmeUseCase {
    constructor(filmeRepositorio = new FilmeRepositorio()) {
        this.filmeRepositorio = filmeRepositorio;
    }

    async execute(id) {
        const filme = await this.filmeRepositorio.buscarPorId(id);

        if (!filme) {
            throw new Error("Filme não encontrado.");
        }

        return filme;
    }
}
