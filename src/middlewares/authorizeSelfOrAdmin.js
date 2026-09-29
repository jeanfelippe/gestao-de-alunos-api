import ApiError from '../utils/ApiError.js';

function authorizeSelfOrAdmin(req, res, next) {
  const { alunoId } = req.params;
  const ehAdmin = req.user?.role === 'admin';
  const ehOProprioAluno = req.user?.role === 'aluno' && String(req.user.id) === String(alunoId);

  // LOG DE DEPURACAO TEMPORARIO:
  console.log('--- DEBUG authorizeSelfOrAdmin ---');
  console.log('req.params.alunoId:', alunoId, typeof alunoId);
  console.log('req.user:', req.user);
  console.log('ehAdmin:', ehAdmin);
  console.log('ehOProprioAluno:', ehOProprioAluno);
  console.log('---------------------------------');

  if (!ehAdmin && !ehOProprioAluno) {
    return next(new ApiError(403, 'Você só pode acessar os seus próprios dados.'));
  }
  next();
}

export default authorizeSelfOrAdmin;