import mongoose from 'mongoose';

const alunoSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'aluno'], default: 'aluno' },
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  matricula: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  
});

const Aluno = mongoose.model('Aluno', alunoSchema);

/**
 * Remove a senha e dados sensíveis do objeto do aluno antes de retornar na API
 */
export function sanitizeAluno(aluno) {
  if (!aluno) return null;
  
  const alunoObj = aluno.toObject ? aluno.toObject() : { ...aluno };
  delete alunoObj.password;
  delete alunoObj.__v;
  
  return alunoObj;
}

// Exportação padrão do modelo
export default Aluno;