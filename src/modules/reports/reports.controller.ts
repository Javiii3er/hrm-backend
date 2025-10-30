import { Request, Response } from 'express';
import { ReportsService } from './reports.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const reportsService = new ReportsService();

export class ReportsController {
  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await reportsService.getReportTemplates();
      sendSuccess(res, templates, 200, { message: 'Plantillas obtenidas' });
    } catch (error) {
      sendError(res, 'TEMPLATES_ERROR', 'Error al obtener plantillas', 500);
    }
  }

  async generate(req: Request, res: Response) {
    try {
      const report = await reportsService.generateReport(req.body);
      sendSuccess(res, report, 200, { message: 'Reporte generado correctamente' });
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      sendError(res, 'REPORT_ERROR', error.message || 'Error al generar reporte', 500);
    }
  }
}

export const reportsController = new ReportsController();
