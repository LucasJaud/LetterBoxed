import { Router } from 'express';
import { AvaliacoesController } from '../controllers/AvaliacoesController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const avaliacoesRotas = Router();
const avaliacoesController = new AvaliacoesController();

// Todas as rotas de avaliação exigem login (authMiddleware)
avaliacoesRotas.post('/:filmeId', authMiddleware, (req, res) => avaliacoesController.avaliar(req, res));
avaliacoesRotas.get('/:filmeId', authMiddleware, (req, res) => avaliacoesController.listarPorFilme(req, res));
avaliacoesRotas.get('/:filmeId/minha', authMiddleware, (req, res) => avaliacoesController.buscarMinhaAvaliacao(req, res));

export default avaliacoesRotas;
