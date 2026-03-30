import express, { Router } from 'express';
import tailoringController from '../controllers/tailoringController';
import verifyToken from '../middlewares/authMiddleware';

const router: Router = express.Router();

router.post('/job-postings', verifyToken, tailoringController.createJobPosting);
router.get('/cvs/:cvId/tailor/:jobPostingId', verifyToken, tailoringController.getTailoringProposals);
router.post('/tailored-cvs', verifyToken, tailoringController.createTailoredCV);
router.post('/tailored-cvs/:tailoredCvId/optimize', verifyToken, tailoringController.optimizeTailoredCV);

export default router;
