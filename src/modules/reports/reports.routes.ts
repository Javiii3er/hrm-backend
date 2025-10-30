import { Router } from 'express';
import { reportsController } from './reports.controller.js';

const router = Router();

router.get('/templates', (req, res) => reportsController.getTemplates(req, res));
router.post('/generate', (req, res) => reportsController.generate(req, res));

export default router;
