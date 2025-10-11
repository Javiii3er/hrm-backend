// src/core/middleware/upload.ts
import multer from 'multer';
import { env } from '../config/env.js';

export const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg', 
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE')); 
    }
  }
});