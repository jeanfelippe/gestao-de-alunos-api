import 'dotenv/config';
import app from './app.js';
import { connectDB } from './database/db.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Aguarda a conexão do MongoDB ser 100% estabelecida
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando com sucesso na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();