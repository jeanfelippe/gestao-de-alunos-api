import 'dotenv/config';
import { api } from './api.js';

let tokenAdminEmCache = null;

async function login(email, senha) {
  const res = await api()
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email, senha });

  if (!res.body.token) {
    throw new Error(`Login falhou (${res.status}) para ${email}: ${JSON.stringify(res.body)}`);
  }
  return `Bearer ${res.body.token}`;
}

export async function loginAdmin() {
  if (!tokenAdminEmCache) {
    tokenAdminEmCache = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
  }
  return tokenAdminEmCache;
}

export async function loginAluno(email, senha) {
  return login(email, senha);
}

export async function loginComoAluno(email, senha) {
  return api()
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email, senha });
}

// Compatibilidade com os testes existentes
export const comTokenDeAdmin = loginAdmin;
export const comTokenDeAluno = () =>
  loginAluno(process.env.ALUNO_EMAIL, process.env.ALUNO_SENHA);
export const getToken = async (email, senha) =>
  (await loginAluno(email, senha)).replace('Bearer ', '');