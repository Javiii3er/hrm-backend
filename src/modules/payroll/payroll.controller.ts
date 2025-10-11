// src/modules/payroll/payroll.controller.ts (FINAL Y CORREGIDO)
import { Request, Response } from 'express';
import { PayrollService } from './payroll.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const payrollService = new PayrollService();

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'UNKNOWN_SERVER_ERROR';
};

export class PayrollController {
  async createPayroll(req: Request, res: Response) {
    try {
      const result = await payrollService.createPayroll(req.body);
      sendSuccess(res, result, 201, 'Nómina creada exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      switch (errorMessage) {
        case 'INVALID_DATE_RANGE': sendError(res, 'INVALID_DATE_RANGE', 'Rango de fechas inválido', 422); break;
        case 'OVERLAPPING_PERIOD': sendError(res, 'OVERLAPPING_PERIOD', 'Periodo se superpone con otra nómina', 409); break;
        case 'DEPARTMENT_NOT_FOUND': sendError(res, 'DEPARTMENT_NOT_FOUND', 'Departamento no encontrado', 404); break;
        default: sendError(res, 'CREATE_ERROR', 'Error al crear nómina', 500);
      }
    }
  }

  async getPayrolls(req: Request, res: Response) {
    try {
      const result = await payrollService.getPayrolls(req.query as any);
      sendSuccess(res, result, 200, 'Nóminas obtenidas'); 
    } catch (error: unknown) {
      sendError(res, 'FETCH_ERROR', 'Error al obtener nóminas', 500);
    }
  }

  async getPayroll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await payrollService.getPayrollById(id);
      sendSuccess(res, result, 200, 'Detalles de nómina obtenidos');
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'PAYROLL_NOT_FOUND') {
        sendError(res, 'PAYROLL_NOT_FOUND', 'Nómina no encontrada', 404);
      } else {
        sendError(res, 'FETCH_ERROR', 'Error al obtener nómina', 500);
      }
    }
  }

  async generateItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await payrollService.generatePayrollItems(id, req.body);
      sendSuccess(res, result, 200, 'Items de nómina generados');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      switch (true) { 
        case errorMessage === 'PAYROLL_NOT_FOUND': 
            sendError(res, 'PAYROLL_NOT_FOUND', 'Nómina no encontrada', 404); 
            break;
        case errorMessage === 'PAYROLL_NOT_EDITABLE': 
            sendError(res, 'PAYROLL_NOT_EDITABLE', 'Nómina no editable', 422); 
            break;
        case errorMessage === 'NO_EMPLOYEES_FOUND': 
            sendError(res, 'NO_EMPLOYEES_FOUND', 'No hay empleados para generar nómina', 422); 
            break;

        case errorMessage.startsWith('EMPLOYEE_NOT_FOUND'): 
            sendError(res, 'EMPLOYEE_NOT_FOUND_IN_ITEMS', 'Uno o más empleados en la lista no existen', 404);
            break;
        default: sendError(res, 'GENERATION_ERROR', 'Error al generar items', 500);
      }
    }
  }

  async finalizePayroll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await payrollService.finalizePayroll(id);
      sendSuccess(res, result, 200, 'Nómina finalizada exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      switch (errorMessage) {
        case 'PAYROLL_NOT_FOUND': sendError(res, 'PAYROLL_NOT_FOUND', 'Nómina no encontrada', 404); break;
        case 'PAYROLL_ALREADY_FINALIZED': sendError(res, 'PAYROLL_ALREADY_FINALIZED', 'Nómina ya finalizada', 422); break;
        case 'NO_PAYROLL_ITEMS': sendError(res, 'NO_PAYROLL_ITEMS', 'No hay items en la nómina', 422); break;
        default: sendError(res, 'FINALIZE_ERROR', 'Error al finalizar nómina', 500);
      }
    }
  }

  async deletePayroll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await payrollService.deletePayroll(id);
      sendSuccess(res, result, 200, 'Nómina eliminada exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      switch (errorMessage) {
        case 'PAYROLL_NOT_FOUND': sendError(res, 'PAYROLL_NOT_FOUND', 'Nómina no encontrada', 404); break;
        case 'PAYROLL_NOT_DELETABLE': sendError(res, 'PAYROLL_NOT_DELETABLE', 'Solo nóminas en borrador pueden eliminarse', 422); break;
        default: sendError(res, 'DELETE_ERROR', 'Error al eliminar nómina', 500);
      }
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const result = await payrollService.getPayrollStats();
      sendSuccess(res, result, 200, 'Estadísticas de nóminas obtenidas');
    } catch (error: unknown) {
      sendError(res, 'STATS_ERROR', 'Error al obtener estadísticas', 500);
    }
  }
}

export const payrollController = new PayrollController();