import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { prisma } from '../../core/config/database.js'; 
import { documentController } from './document.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { upload } from '../../core/middleware/upload.js';
import { DocumentUploadSchema, DocumentQuerySchema } from './document.schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(authenticateJWT); 

router.get('/',
  authorize('ADMIN', 'RRHH'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const skip = (page - 1) * pageSize;

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;

      const where: any = {};
      if (employeeId) where.employeeId = employeeId;
      if (startDate && endDate)
        where.createdAt = { gte: startDate, lte: endDate };
      else if (startDate)
        where.createdAt = { gte: startDate };
      else if (endDate)
        where.createdAt = { lte: endDate };

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          include: {
            employee: { select: { firstName: true, lastName: true } },
            uploader: { select: { email: true } },
          },
        }),
        prisma.document.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: { data: documents, total },
      });
    } catch (error) {
      console.error('Error al obtener documentos globales:', error);
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Error al obtener documentos globales' },
      });
    }
  }
);

router.get('/:docId/download',
  authorize('ADMIN', 'RRHH', 'EMPLEADO'),
  async (req, res) => {
    try {
      const { docId } = req.params;

      const document = await prisma.document.findUnique({
        where: { id: docId },
        include: {
          employee: { select: { firstName: true, lastName: true } },
        },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento no encontrado' },
        });
      }

      const uploadsDir = path.join(__dirname, '../../../uploads');
      const filePath = path.join(uploadsDir, document.storageKey);

      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          error: { code: 'FILE_NOT_FOUND', message: 'Archivo no encontrado en el servidor' },
        });
      }
      const safeName = document.employee
        ? `${document.employee.firstName}_${document.employee.lastName}_${document.filename}`
        : document.filename;

      res.download(filePath, safeName, (err) => {
        if (err) {
          console.error('Error al enviar el archivo:', err);
          res.status(500).json({
            success: false,
            error: { code: 'DOWNLOAD_ERROR', message: 'Error al descargar archivo' },
          });
        }
      });

    } catch (error) {
      console.error('Error al descargar documento:', error);
      res.status(500).json({
        success: false,
        error: { code: 'DOWNLOAD_ERROR', message: 'Error interno al descargar documento' },
      });
    }
  }
);

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
