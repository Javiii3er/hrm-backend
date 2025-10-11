// src/modules/employees/employee.routes.ts
import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { 
  EmployeeCreateSchema, 
  EmployeeUpdateSchema, 
  EmployeeQuerySchema 
} from './employee.schemas.js';

const router = Router();

router.use(authenticateJWT);


router.get('/', 
  authorize('ADMIN', 'RRHH'), 
  validate(EmployeeQuerySchema), 
  employeeController.getEmployees
);

router.get('/stats', 
  authorize('ADMIN', 'RRHH'), 
  employeeController.getStats
);

router.post('/', 
  authorize('ADMIN', 'RRHH'), 
  validate(EmployeeCreateSchema), 
  employeeController.createEmployee
);


router.get('/:id', 
  authorize('ADMIN', 'RRHH', 'EMPLEADO'), 
  employeeController.getEmployee
);

router.put('/:id', 
  authorize('ADMIN', 'RRHH'), 
  validate(EmployeeUpdateSchema), 
  employeeController.updateEmployee
);

router.delete('/:id', 
  authorize('ADMIN'),
  employeeController.deleteEmployee
);

export default router;