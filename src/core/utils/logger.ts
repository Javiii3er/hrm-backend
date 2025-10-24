// src/core/utils/logger.ts
import winston, { format } from 'winston';
import { TransformableInfo } from 'logform';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { 
    service: 'hrm-api',
    timestamp: new Date().toISOString()
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
      format.printf(({ level, message, timestamp, ...meta }: TransformableInfo) => {
        return `${timestamp} [${level}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
    )
  }));
}