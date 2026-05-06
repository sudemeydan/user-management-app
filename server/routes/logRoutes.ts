import express, { Router } from 'express';
import logController from '../controllers/logController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router: Router = express.Router();

// Sadece ADMIN veya SUPERADMIN logları görebilir
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'SUPERADMIN']), logController.getLogs);

export default router;
