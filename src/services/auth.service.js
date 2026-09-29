import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Administrador from '../models/admin.model.js';
import Aluno from '../models/aluno.model.js';
import ApiError from '../utils/ApiError.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

function gerarToken(usuario) {
  // Garantimos o fallback para usuario._id caso usuario.id venha undefined
  const userId = usuario.id || usuario._id;

  return jwt.sign(
    { sub: userId, role: usuario.role, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function login({ email, senha }) {
  if (!email || !senha) {
    throw new ApiError(400, 'Os campos "email" e "senha" são obrigatórios.');
  }

  // Busca o admin ou o aluno trazendo explicitamente os campos de senha
  const admin = await Administrador.findOne({ email }).select('+senha +password');
  const aluno = admin ? null : await Aluno.findOne({ email }).select('+senha +password');
  const usuario = admin || aluno;

  if (!usuario) {
    throw new ApiError(401, 'E-mail ou senha inválidos.');
  }

  // Verifica se o hash está no campo 'senha' ou no campo 'password'
  const hashSenha = usuario.senha || usuario.password;

  if (!hashSenha || !bcrypt.compareSync(senha, hashSenha)) {
    throw new ApiError(401, 'E-mail ou senha inválidos.');
  }

  const userId = usuario.id || usuario._id;

  return {
    token: gerarToken(usuario),
    usuario: {
      id: userId,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  };
}

export default { login };