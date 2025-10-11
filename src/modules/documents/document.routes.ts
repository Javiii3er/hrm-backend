// src/modules/documents/document.routes.ts
import { Router } from 'express';
import { documentController } from './document.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { upload } from '../../core/middleware/upload.js';
import { DocumentUploadSchema, DocumentQuerySchema } from './document.schemas.js';

const router = Router();
router.use(authenticateJWT); 

router.post('/:id/documents',
  authorize('ADMIN', 'RRHH'),
  upload.single('document'),
  validate(DocumentUploadSchema), 
  documentController.uploadDocument
);

router.get('/:id/documents',
  authorize('ADMIN', 'RRHH', 'EMPLEADO'),
  validate(DocumentQuerySchema),
  documentController.getDocuments
);

router.get('/:id/documents/stats',
  authorize('ADMIN', 'RRHH', 'EMPLEADO'),
  documentController.getStats
);

router.get('/:id/documents/:docId/download',
  authorize('ADMIN', 'RRHH', 'EMPLEADO'),
  documentController.downloadDocument
);

router.delete('/:id/documents/:docId',
  authorize('ADMIN', 'RRHH'), 
  documentController.deleteDocument
);

export default router;