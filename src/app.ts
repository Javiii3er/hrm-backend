import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

import { requestLogger } from './core/middleware/logging.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { env } from './core/config/env.js';

import authRoutes from './modules/auth/auth.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import departmentRoutes from './modules/departments/department.routes.js';
import documentRoutes from './modules/documents/document.routes.js';
import payrollRoutes from './modules/payroll/payroll.routes.js';
import userRoutes from './modules/users/user.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://hrm-frontend-sigma-three.vercel.app', 
        'https://hrm-backend-o1nu.onrender.com' 
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS bloqueado para este origen'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

app.use('/api/uploads', express.static('uploads'));
app.use('/downloads', express.static(path.resolve('reports')));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    },
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`,
    },
  });
});


app.use(errorHandler);

export default app;
