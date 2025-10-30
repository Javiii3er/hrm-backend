// src/server.ts
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { connectDB } from './core/config/database.js';
import { env } from './core/config/env.js';
import app from './app.js';

const PORT = env.PORT;
let server: any;

async function startServer() {
  try {
    await connectDB();

    app.use('/downloads', express.static(path.resolve('reports')));

    server = app.listen(PORT, () => {
      console.log('Servidor HRM ejecutándose...');
      console.log(`Entorno: ${env.NODE_ENV}`);
      console.log(`Puerto: ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base: http://localhost:${PORT}/api`);
      console.log(`Descargas disponibles en: http://localhost:${PORT}/downloads`);
    });

  } catch (error) {
    console.error(' Error fatal al iniciar el servidor o conectar la DB:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`\nRecibida señal ${signal}, cerrando servidor...`);
  
  server.close(async () => {
    console.log(' Express Server cerrado correctamente.');
    console.log('Proceso terminado.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Cierre forzado por timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
