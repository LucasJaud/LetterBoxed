import { ListarFilmesUseCase } from '../useCases/ListarFilmesUseCase.js';
import { DetalharFilmeUseCase } from '../useCases/DetalharFilmeUseCase.js';
import { SeedService } from '../useCases/SeedService.js';

export class FilmesController {
    async detalhar(req, res) {
        try {
            const { id } = req.params;
            const detalharFilmeUseCase = new DetalharFilmeUseCase();
            const filme = await detalharFilmeUseCase.execute(id);

            return res.status(200).json(filme);
        } catch (error) {
            if (error.message === "Filme não encontrado.") {
                return res.status(404).json({ error: error.message });
            }
            console.error('Falha ao detalhar filme:', error);
            return res.status(500).json({ error: 'Erro interno ao buscar detalhes do filme' });
        }
    }

    async listar(req, res) {
        try {
            const pagina = req.query.pagina || 1;
            const limite = req.query.limite || 20;
            const genero = req.query.genero || '';
            const ano = req.query.ano || '';
            const diretor = req.query.diretor || '';
            const roteirista = req.query.roteirista || '';
            const titulo = req.query.titulo || '';

            const listarFilmesUseCase = new ListarFilmesUseCase();

            const filmes = await listarFilmesUseCase.execute({ pagina, limite, genero, ano, diretor, roteirista, titulo });

            return res.status(200).json(filmes);

        } catch (error) {
            console.error('Falha no FilmesController:', error);
            console.log("DETALHE DO ERRO:", error.message);
            return res.status(500).json({ error: 'Erro interno ao tentar listar os filmes' });
        }
    }

    async seed(req, res) {
        console.log('--- Método seed foi disparado pelo Cron Job / Endpoint ---');
        try {
            const paginas = parseInt(req.query.paginas) || 2;
            const dataMinima = req.query.dataMinima || null;

            const seedService = new SeedService();
            const resultado = await seedService.executarSeed(paginas, dataMinima);

            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Falha no Seed de Filmes:', error);
            return res.status(500).json({ error: 'Erro interno durante a execução do seed' });
        }
    }
}
