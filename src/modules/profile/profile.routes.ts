// src/modules/profile/profile.routes.ts
import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticateJWT, authorize } from '../../core/middleware/authGuard.js';
import { validate } from '../../core/middleware/validation.js';
import { UpdateProfileSchema } from './profile.schemas.js';

const router = Router();


router.use(authenticateJWT);
router.get('/', profileController.getProfile);

router.put(
  '/',
  authorize('ADMIN'),        
  validate(UpdateProfileSchema), 
  profileController.updateProfile
);

export default router;
