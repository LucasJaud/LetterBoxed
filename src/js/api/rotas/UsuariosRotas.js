import { Router } from 'express';
import { UsuariosController } from '../controllers/UsuariosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const usuariosRotas = Router();
const usuariosController = new UsuariosController();

usuariosRotas.post('/login', (req, res) => usuariosController.login(req, res));
usuariosRotas.post('/registrar', (req, res) => usuariosController.registrar(req, res));
usuariosRotas.get('/perfil', authMiddleware, (req, res) => usuariosController.obterPerfil(req, res));

export default usuariosRotas;
