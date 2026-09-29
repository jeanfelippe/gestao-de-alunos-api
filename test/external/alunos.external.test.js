import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { comTokenDeAdmin } from '../helpers/auth.js';
import Aluno from '../../src/models/aluno.model.js';
import { api } from '../helpers/api.js';
import alunos from '../fixtures/alunos.json' with { type: 'json' };

describe('Alunos External', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  for (const caso of alunos) {
    it(caso.testTitle, async () => {
      // 1. Limpa especificamente o registro deste caso de teste
      await Aluno.deleteMany({
        $or: [
          { email: caso.email },
          { matricula: caso.matricula }
        ]
      });

      // 2. Se o teste espera 409, pré-cadastra o aluno antes da requisição da API
      if (caso.statusCodeEsperado === 409) {
        await Aluno.create({
          nome: caso.nome,
          email: caso.email,
          matricula: caso.matricula,
          password: 'password123',
        });
      }

      const token = await comTokenDeAdmin();
      const cadastroAlunoResposta = await api()
        .post('/api/admin/alunos')
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .send({
          nome: caso.nome,
          email: caso.email,
          matricula: caso.matricula,
          senha: caso.senha,
        });

      expect(cadastroAlunoResposta.status).to.equal(caso.statusCodeEsperado);

      if (caso.statusCodeEsperado === 201) {
        expect(cadastroAlunoResposta.body.nome).to.equal(caso.nome);
        expect(cadastroAlunoResposta.body.email).to.equal(caso.email);
        expect(cadastroAlunoResposta.body.matricula).to.equal(caso.matricula);
      }
    });
  }
});