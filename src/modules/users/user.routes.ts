import { Router } from 'express';
import { userController } from './user.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { 
  UserCreateSchema, 
  UserUpdateSchema, 
  UserQuerySchema,
  ChangeUserPasswordSchema 
} from './user.schemas.js';

const router = Router();
router.use(authenticateJWT);

router.get('/', 
  authorize('ADMIN'), 
  validate(UserQuerySchema),
);

router.get('/stats', 
  authorize('ADMIN'), 
  userController.getStats
);

router.post('/', 
  authorize('ADMIN'), 
  validate(UserCreateSchema),
);

router.get('/:id', 
  authorize('ADMIN'), 
  userController.getUser
);

router.put('/:id', 
  authorize('ADMIN'), 
  validate(UserUpdateSchema),
  userController.updateUser
);

router.post('/:id/change-password', 
  authorize('ADMIN'), 
  validate(ChangeUserPasswordSchema),
  userController.changePassword
);

router.delete('/:id', 
  authorize('ADMIN'), 
  userController.deleteUser
);

export default router;