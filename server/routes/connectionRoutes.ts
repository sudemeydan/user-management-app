import express, { Router } from 'express';
import connectionController from '../controllers/connectionController';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = express.Router();

router.post('/request', authMiddleware, connectionController.sendRequest);
router.put('/accept/:id', authMiddleware, connectionController.acceptRequest);
router.delete('/remove/:id', authMiddleware, connectionController.rejectOrRemoveRequest);

export default router;
