import jwt from 'jsonwebtoken';
import { UsuarioRepositorio } from '../../bd/repositorios/usuarioRepositorio.js';
import { LoginUseCase } from '../useCases/LoginUseCase.js';
import { RegistrarUsuarioUseCase } from '../useCases/RegistrarUsuarioUseCase.js';
import { ObterPerfilUsuarioUseCase } from '../useCases/ObterPerfilUsuarioUseCase.js';
export class UsuariosController {
    
    // Método correspondente a rota POST para entrar na conta (Login)
    async login(req, res) {
        try {
            // O express extrai magicamente o e-mail e a senha do pacote de rede enviado pelo frontend
            const { email, senha } = req.body;

            // Instancia o repositório de usuários (PostgreSQL via Sequelize)
            const usuarioRepositorio = new UsuarioRepositorio();
            
            // Instancia o super-cérebro das nossas regras, entregando a ele o nosso repositório
            const loginUseCase = new LoginUseCase(usuarioRepositorio);

            // Bate na porta do Casos de Uso. 
            // Se a senha estiver errada, o UseCase quebra o programa com throw Error na hora!
            const resultado = await loginUseCase.execute({ email, senha });

            // Gera o token JWT
            const segredo = process.env.JWT_SECRET || 'chave_secreta_padrao';
            const token = jwt.sign({ id: resultado.id, email: resultado.email }, segredo, { expiresIn: '2h' });

            // Se o programa não quebrou de erro, o Return devolveu o nosso usuário limpo.
            // Retorna a bandeira de sucesso (Status HTTP 200 = Sucesso / OK) com as informações.
            return res.status(200).json({
                mensagem: "Autenticação aprovada!",
                token,
                dados: resultado
            });

        } catch (error) {
            // Erros de validação ou credenciais inválidas retornam HTTP 401
            console.error("Tentativa de Login falhou:", error.message);
            return res.status(401).json({ erro: error.message });
        }
    }

    // Método correspondente a rota POST para criar nova conta (Registro)
    async registrar(req, res) {
        try {
            const { nome, email, senha } = req.body;

            const usuarioRepositorio = new UsuarioRepositorio();
            const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepositorio);

            const resultado = await registrarUsuarioUseCase.execute({ nome, email, senha });

            // Retorna o status HTTP 201 (Created) em caso de sucesso
            return res.status(201).json({
                mensagem: "Usuário registrado com sucesso!",
                dados: resultado
            });
        } catch (error) {
            console.error("Tentativa de Registro falhou:", error.message);
            // Retorna status 400 (Bad Request) para erros de validação ou e-mail duplicado
            return res.status(400).json({
                erro: error.message,
                message: error.message // Ambos os formatos para compatibilidade com o frontend
            });
        }
    }

    async obterPerfil(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const obterPerfilUseCase = new ObterPerfilUsuarioUseCase();
            const perfil = await obterPerfilUseCase.execute(usuarioId);

            return res.status(200).json(perfil);
        } catch (error) {
            console.error("Erro ao obter perfil:", error.message);

            if (error.message === "Usuário não encontrado.") {
                return res.status(404).json({ erro: error.message });
            }

            return res.status(500).json({ erro: "Erro ao buscar perfil do usuário." });
        }
    }
}
