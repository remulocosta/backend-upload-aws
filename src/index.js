// Importa as dependências necessárias
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// Inicializa a aplicação Express
const app = express();

/**
 * Configuração da base de dados
 */
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true, // Corrigindo o typo: "useNewUrlParsers"
            useUnifiedTopology: true // Adiciona opção para usar o novo sistema de topologia
        });
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToDatabase();

/**
 * Middleware para configuração do Express
 */
app.use(cors());                                         // Permite requisições cross-origin
app.use(express.json());                                  // Suporte para parsing de JSON no body
app.use(express.urlencoded({ extended: true }));         // Suporte para parsing de URL-encoded payloads
app.use(morgan("dev"));                                  // Logging das requisições em modo de desenvolvimento
app.use("/files", express.static(path.resolve(__dirname, "..", "tmp", "uploads")));  // Servir arquivos estáticos

// Importa e utiliza as rotas definidas em outro módulo
app.use(require("./routes"));

/**
 * Função para iniciar o servidor
 */
const startServer = async () => {
    try {
        // Conecta-se ao banco de dados
        await connectToDatabase();

        // Configuração de HOST e PORT
        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || '0.0.0.0';

        // Inicia o servidor na porta e host especificados
        app.listen(PORT, HOST, () => {
            console.log(`🚀 Server started on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start the server:", err);
        process.exit(1);
    }
};

// Chama a função para iniciar o servidor
startServer();
