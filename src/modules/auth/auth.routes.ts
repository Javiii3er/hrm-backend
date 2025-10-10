// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../core/middleware/validation.js';
import { 
  LoginSchema, 
  RefreshTokenSchema, 
  ChangePasswordSchema 
} from './auth.schemas.js';
import { authenticateJWT } from '../../core/middleware//authGuard.js';

const router = Router();

router.post('/login', validate(LoginSchema), authController.login);
router.post('/refresh', validate(RefreshTokenSchema), authController.refreshToken);

router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getCurrentUser);
router.post('/change-password', 
  authenticateJWT, 
  validate(ChangePasswordSchema), 
  authController.changePassword
);

export default router;