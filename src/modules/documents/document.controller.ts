// src/modules/documents/document.controller.ts
import { Request, Response } from 'express';
import { DocumentService } from './document.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const documentService = new DocumentService();

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'UNKNOWN_SERVER_ERROR';
};

interface DocumentRequest extends Request {
    file?: Express.Multer.File;
}

export class DocumentController {
  async uploadDocument(req: DocumentRequest, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'NO_FILE', 'No se ha subido ningún archivo', 400);
      }

      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const { id: employeeId } = req.params;
      const result = await documentService.uploadDocument(
        employeeId, 
        req.file, 
        req.body, 
        req.user.id
      );

      sendSuccess(res, result, 201, 'Documento subido exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'EMPLOYEE_NOT_FOUND':
          sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
          break;
        case 'FILE_TOO_LARGE':
          sendError(res, 'FILE_TOO_LARGE', 'El archivo excede el tamaño máximo permitido', 413);
          break;
        case 'INVALID_FILE_TYPE':
          sendError(res, 'INVALID_FILE_TYPE', 'Tipo de archivo no permitido', 415);
          break;
        case 'FILE_SAVE_ERROR':
          sendError(res, 'FILE_SAVE_ERROR', 'Error al guardar el archivo', 500);
          break;
        default:
          sendError(res, 'UPLOAD_ERROR', 'Error al subir documento', 500);
      }
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const { id: employeeId } = req.params;
      const result = await documentService.getEmployeeDocuments(employeeId, req.query as any);
      
      sendSuccess(res, result, 200, 'Documentos obtenidos exitosamente'); 

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      if (errorMessage === 'EMPLOYEE_NOT_FOUND') {
        sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
      } else {
        sendError(res, 'FETCH_ERROR', 'Error al obtener documentos', 500);
      }
    }
  }

  async downloadDocument(req: Request, res: Response) {
    try {
      const { id: employeeId, docId: documentId } = req.params;
      const result = await documentService.downloadDocument(employeeId, documentId);

      res.setHeader('Content-Type', result.document.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.document.filename}"`);
      res.setHeader('Content-Length', result.document.size || 0);

      res.sendFile(result.filePath);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'DOCUMENT_NOT_FOUND':
        case 'FILE_NOT_FOUND':
          sendError(res, 'DOCUMENT_NOT_FOUND', 'Documento no encontrado', 404);
          break;
        default:
          sendError(res, 'DOWNLOAD_ERROR', 'Error al descargar documento', 500);
      }
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const { id: employeeId, docId: documentId } = req.params;
      
      const result = await documentService.deleteDocument(
        employeeId, 
        documentId, 
        req.user.id, 
        req.user.role
      );

      sendSuccess(res, result, 200, 'Documento eliminado exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'DOCUMENT_NOT_FOUND':
          sendError(res, 'DOCUMENT_NOT_FOUND', 'Documento no encontrado', 404);
          break;
        case 'UNAUTHORIZED_DELETE':
          sendError(res, 'UNAUTHORIZED_DELETE', 'No tienes permisos para eliminar este documento', 403);
          break;
        default:
          sendError(res, 'DELETE_ERROR', 'Error al eliminar documento', 500);
      }
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { id: employeeId } = req.params;
      const result = await documentService.getDocumentStats(employeeId);
      sendSuccess(res, result, 200, 'Estadísticas de documentos obtenidas');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      if (errorMessage === 'EMPLOYEE_NOT_FOUND') {
        sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
      } else {
        sendError(res, 'STATS_ERROR', 'Error al obtener estadísticas', 500);
      }
    }
  }
}

export const documentController = new DocumentController();