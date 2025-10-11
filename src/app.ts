// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from './core/middleware/logging.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { env } from './core/config/env.js';

import authRoutes from './modules/auth/auth.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js'; 
import documentRoutes from './modules/documents/document.routes.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://tudominio.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

app.use('/api/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes); 
app.use('/api/employees', documentRoutes); 

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0'
    }
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`
    }
  });
});

app.use(errorHandler);

export default app;