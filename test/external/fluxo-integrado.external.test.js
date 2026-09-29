import { expect } from 'chai';
import { comTokenDeAdmin, loginComoAluno } from '../helpers/auth.js';
import { api } from '../helpers/api.js';
import Aluno from '../../src/models/aluno.model.js';
import Matricula from '../../src/models/matricula.model.js';
import Trabalho from '../../src/models/trabalho.model.js';
import Disciplina from '../../src/models/disciplina.model.js';
import fluxoCases from '../fixtures/fluxo-integrado.json' with { type: 'json' };

async function limparAluno(email) {
  const aluno = await Aluno.findOne({ email });
  if (!aluno) return;
  await Trabalho.deleteMany({ alunoId: aluno._id });
  await Matricula.deleteMany({ alunoId: aluno._id });
  await Aluno.deleteOne({ _id: aluno._id });
}

describe('Fluxo integrado de aluno', () => {
  const disciplinas = {};

  before(async () => {
    for (const codigo of new Set(fluxoCases.map((c) => c.disciplinaCodigo))) {
      disciplinas[codigo] =
        (await Disciplina.findOne({ codigo })) ||
        (await Disciplina.create({ nome: 'Matemática', codigo }));
    }
  });

  for (const caso of fluxoCases) {
    it(caso.testTitle, async () => {
      await limparAluno(caso.email);
      const tokenAdmin = await comTokenDeAdmin();
      const idDisciplina = String(disciplinas[caso.disciplinaCodigo]._id);

      // 1. Admin cadastra o aluno
      const cadastro = await api()
        .post('/api/admin/alunos')
        .set('Authorization', tokenAdmin)
        .send({ nome: caso.nome, email: caso.email, matricula: caso.matricula, senha: caso.senha });
      expect(cadastro.status, JSON.stringify(cadastro.body)).to.equal(caso.cadastroStatusEsperado);

      // 2. Aluno faz login
      const login = await loginComoAluno(caso.email, caso.senha);
      expect(login.status, JSON.stringify(login.body)).to.equal(caso.loginStatusEsperado);
      const tokenAluno = `Bearer ${login.body.token}`;
      const alunoId = String(login.body.usuario.id);

      // 3. Admin matricula (quando o caso pede)
      if (caso.matricular) {
        const matricula = await api()
          .post(`/api/admin/disciplinas/${idDisciplina}/matriculas`)
          .set('Authorization', tokenAdmin)
          .send({ alunoId });
        expect(matricula.status, JSON.stringify(matricula.body)).to.equal(caso.matriculaStatusEsperado);
      }

      // 4. Aluno registra a entrega
      const entrega = await api()
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', tokenAluno)
        .send({ disciplinaId: idDisciplina, titulo: caso.titulo, descricao: caso.descricao });
      expect(entrega.status, JSON.stringify(entrega.body)).to.equal(caso.entregaStatusEsperado);

      if (caso.entregaStatusEsperado === 201) {
        expect(entrega.body.titulo).to.equal(caso.titulo);
        expect(entrega.body.descricao).to.equal(caso.descricao);
      }
    });
  }
});