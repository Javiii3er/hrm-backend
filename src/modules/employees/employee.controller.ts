// src/modules/employees/employee.controller.ts
import { Request, Response } from 'express';
import { EmployeeService } from './employee.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const employeeService = new EmployeeService();

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'UNKNOWN_SERVER_ERROR';
};

export class EmployeeController {
  
  async createEmployee(req: Request, res: Response) {
    try {
      const result = await employeeService.createEmployee(req.body);
      sendSuccess(res, result, 201, 'Empleado creado exitosamente'); 
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'DUPLICATE_NATIONAL_ID':
          sendError(res, 'DUPLICATE_NATIONAL_ID', 'La cédula ya está registrada', 409);
          break;
        case 'DUPLICATE_EMAIL':
          sendError(res, 'DUPLICATE_EMAIL', 'El email ya está registrado', 409);
          break;
        case 'DEPARTMENT_NOT_FOUND':
          sendError(res, 'DEPARTMENT_NOT_FOUND', 'El departamento no existe', 404);
          break;
        default:
          sendError(res, 'CREATE_ERROR', 'Error al crear empleado', 500);
      }
    }
  }

  async getEmployees(req: Request, res: Response) {
    try {
      const result = await employeeService.getEmployees(req.query as any); 
      sendSuccess(res, result, 200, 'Listado de empleados'); 
      
    } catch (error: unknown) {
      sendError(res, 'FETCH_ERROR', 'Error al obtener empleados', 500);
    }
  }

  async getEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await employeeService.getEmployeeById(id);
      sendSuccess(res, result, 200, 'Detalles de empleado obtenidos'); 
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      if (errorMessage === 'EMPLOYEE_NOT_FOUND') {
        sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
      } else {
        sendError(res, 'FETCH_ERROR', 'Error al obtener empleado', 500);
      }
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await employeeService.updateEmployee(id, req.body);
      sendSuccess(res, result, 200, 'Empleado actualizado exitosamente'); 
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'EMPLOYEE_NOT_FOUND':
          sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
          break;
        case 'DUPLICATE_NATIONAL_ID':
          sendError(res, 'DUPLICATE_NATIONAL_ID', 'La cédula ya está registrada', 409);
          break;
        case 'DUPLICATE_EMAIL':
          sendError(res, 'DUPLICATE_EMAIL', 'El email ya está registrado', 409);
          break;
        case 'DEPARTMENT_NOT_FOUND':
          sendError(res, 'DEPARTMENT_NOT_FOUND', 'El departamento no existe', 404);
          break;
        default:
          sendError(res, 'UPDATE_ERROR', 'Error al actualizar empleado', 500);
      }
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await employeeService.deleteEmployee(id);
      sendSuccess(res, result, 200, 'Empleado eliminado exitosamente'); 
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'EMPLOYEE_NOT_FOUND':
          sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
          break;
        case 'EMPLOYEE_HAS_USER_ACCOUNT':
          sendError(res, 'EMPLOYEE_HAS_USER_ACCOUNT', 'No se puede eliminar: empleado tiene cuenta de usuario', 409);
          break;
        case 'EMPLOYEE_HAS_DOCUMENTS':
          sendError(res, 'EMPLOYEE_HAS_DOCUMENTS', 'No se puede eliminar: empleado tiene documentos', 409);
          break;
        default:
          sendError(res, 'DELETE_ERROR', 'Error al eliminar empleado', 500);
      }
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const result = await employeeService.getEmployeeStats();
      sendSuccess(res, result, 200, 'Estadísticas obtenidas'); 
    } catch (error: unknown) {
      sendError(res, 'STATS_ERROR', 'Error al obtener estadísticas', 500);
    }
  }
}

export const employeeController = new EmployeeController();