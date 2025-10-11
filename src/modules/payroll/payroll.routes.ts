// src/modules/payroll/payroll.routes.ts
import { Router } from 'express';
import { payrollController } from './payroll.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { 
  PayrollCreateSchema, 
  PayrollQuerySchema, 
  GeneratePayrollSchema 
} from './payroll.schemas.js';

const router = Router();
router.use(authenticateJWT);

router.get('/', 
  authorize('ADMIN', 'RRHH'), 
  validate(PayrollQuerySchema),
  payrollController.getPayrolls
);

router.get('/stats', 
  authorize('ADMIN', 'RRHH'), 
  payrollController.getStats
);

router.post('/', 
  authorize('ADMIN', 'RRHH'), 
  validate(PayrollCreateSchema), 
  payrollController.createPayroll
);

router.get('/:id', 
  authorize('ADMIN', 'RRHH'), 
  payrollController.getPayroll
);

router.post('/:id/generate', 
  authorize('ADMIN', 'RRHH'), 
  validate(GeneratePayrollSchema), 
  payrollController.generateItems
);

router.post('/:id/finalize', 
  authorize('ADMIN', 'RRHH'), 
  payrollController.finalizePayroll
);

router.delete('/:id', 
  authorize('ADMIN'), 
  payrollController.deletePayroll
);

export default router;