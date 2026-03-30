import express, { Router, Request, Response, NextFunction } from 'express';
import atsController from '../controllers/atsController';
import verifyToken from '../middlewares/authMiddleware';

const router: Router = express.Router();

// Geleneksel atsController fonksiyonlarını Express Request, Response, NextFunction tipleriyle sarıyoruz
router.post('/cvs/:cvId/optimize', verifyToken, (req: Request, res: Response, next: NextFunction) => {
    atsController.optimizeCVFormat(req, res, next);
});

router.get('/cvs/:cvId/ats-status', verifyToken, (req: Request, res: Response, next: NextFunction) => {
    atsController.getATSStatus(req, res, next);
});

export default router;
