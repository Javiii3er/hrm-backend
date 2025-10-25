// src/modules/documents/document.service.ts
import { prisma } from '../../core/config/database.js';
import { env } from '../../core/config/env.js';
import { DocumentUploadDTO, DocumentQueryDTO } from './document.schemas.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentService {
  private uploadsDir = path.join(__dirname, '../../../uploads');

  constructor() {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  // ✅ FIX: usa el archivo físico de multer.diskStorage
  async uploadDocument(
    employeeId: string,
    file: Express.Multer.File,
    data: DocumentUploadDTO,
    userId: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    // Verificar que multer haya recibido el archivo
    if (!file || !file.path) {
      throw new Error('NO_FILE_RECEIVED');
    }

    const maxFileSize = env.UPLOAD_MAX_FILE_SIZE || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new Error('FILE_TOO_LARGE');
    }

    // ✅ Ya no escribimos el archivo manualmente
    // multer lo guarda en "file.path" automáticamente
    const storageKey = path.basename(file.path);

    const document = await prisma.document.create({
      data: {
        employeeId,
        filename: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
        tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
        description: data.description,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return document;
  }

  async getEmployeeDocuments(employeeId: string, query: DocumentQueryDTO) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    const { page, pageSize, tag } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { employeeId };

    if (tag) {
      where.tags = {
        array_contains: [tag],
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: documents,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  }

  async downloadDocument(employeeId: string, documentId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        employeeId,
      },
    });

    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const filePath = path.join(this.uploadsDir, document.storageKey);

    try {
      await fs.access(filePath);
    } catch {
      throw new Error('FILE_NOT_FOUND');
    }

    return {
      document,
      filePath,
    };
  }

  async deleteDocument(employeeId: string, documentId: string, userId: string, userRole: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        employeeId,
      },
    });

    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    if (document.uploadedBy !== userId && userRole !== 'ADMIN' && userRole !== 'RRHH') {
      throw new Error('UNAUTHORIZED_DELETE');
    }

    const filePath = path.join(this.uploadsDir, document.storageKey);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Advertencia: No se pudo eliminar el archivo físico. Error:', error);
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true, message: 'Documento eliminado correctamente' };
  }

  async getDocumentStats(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    const totalDocuments = await prisma.document.count({
      where: { employeeId },
    });

    const totalSize = await prisma.document.aggregate({
      where: { employeeId },
      _sum: { size: true },
    });

    const byType = await prisma.document.groupBy({
      by: ['mimeType'],
      where: { employeeId },
      _count: { id: true },
    });

    return {
      total: totalDocuments,
      totalSize: totalSize._sum.size || 0,
      byType: byType.map((type) => ({
        mimeType: type.mimeType,
        count: type._count.id,
      })),
    };
  }
}
