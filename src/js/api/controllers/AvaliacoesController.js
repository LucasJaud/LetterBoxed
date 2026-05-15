import { AvaliarFilmeUseCase } from '../useCases/AvaliarFilmeUseCase.js';
import { AvaliacaoRepositorio } from '../../bd/repositorios/avaliacaoRepositorio.js';

export class AvaliacoesController {
    async avaliar(req, res) {
        try {
            const { filmeId } = req.params;
            const { nota, comentario } = req.body;
            const userId = req.usuario.id; // Extraído do token pelo authMiddleware

            const avaliarFilmeUseCase = new AvaliarFilmeUseCase();
            const avaliacao = await avaliarFilmeUseCase.execute({ 
                userId, 
                filmeId, 
                nota: parseFloat(nota), 
                comentario 
            });

            return res.status(201).json({
                mensagem: "Avaliação salva com sucesso!",
                avaliacao
            });
        } catch (error) {
            console.error("Erro ao avaliar filme:", error.message);
            
            if (error.message.includes("Negado pela Entidade")) {
                return res.status(400).json({ erro: error.message });
            }
            
            if (error.message === "Filme não encontrado no banco de dados.") {
                return res.status(404).json({ erro: error.message });
            }

            return res.status(500).json({ erro: "Erro interno ao processar avaliação." });
        }
    }

    async listarPorFilme(req, res) {
        try {
            const { filmeId } = req.params;
            const repositório = new AvaliacaoRepositorio();
            const avaliacoes = await repositório.buscarPorFilme(filmeId);

            return res.status(200).json(avaliacoes);
        } catch (error) {
            console.error("Erro ao listar avaliações:", error.message);
            return res.status(500).json({ erro: "Erro ao buscar avaliações do filme." });
        }
    }

    async buscarMinhaAvaliacao(req, res) {
        try {
            const { filmeId } = req.params;
            const userId = req.usuario.id;
            const repositório = new AvaliacaoRepositorio();
            const avaliacao = await repositório.buscarPorFilmeEUsuario(filmeId, userId);

            return res.status(200).json(avaliacao);
        } catch (error) {
            console.error("Erro ao buscar minha avaliação:", error.message);
            return res.status(500).json({ erro: "Erro ao buscar sua avaliação." });
        }
    }
}
