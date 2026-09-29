import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Administrador from '../models/admin.model.js';
import Aluno from '../models/aluno.model.js';

await mongoose.connect(process.env.MONGODB_URI);

// Admin: o pre('save') do model faz o hash, então passa a senha pura
if (!(await Administrador.findOne({ email: process.env.ADMIN_EMAIL }))) {
  await Administrador.create({
    nome: 'Administrador',
    email: process.env.ADMIN_EMAIL,
    senha: process.env.ADMIN_SENHA,
    role: 'admin',
  });
}

// Aluno: o model não tem hook, então o hash é feito aqui
if (!(await Aluno.findOne({ email: process.env.ALUNO_EMAIL }))) {
  await Aluno.create({
    nome: 'Aluno Seed',
    email: process.env.ALUNO_EMAIL,
    matricula: 'SEED-001',
    password: bcrypt.hashSync(process.env.ALUNO_SENHA, 10),
    role: 'aluno',
  });
}

await mongoose.disconnect();
console.log('Seed concluído.');