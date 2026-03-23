const express = require('express');
const router = express.Router();
const tailoringController = require('../controllers/tailoringController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/job-postings', verifyToken, tailoringController.createJobPosting);
router.get('/cvs/:cvId/tailor/:jobPostingId', verifyToken, tailoringController.getTailoringProposals);
router.post('/tailored-cvs', verifyToken, tailoringController.createTailoredCV);
router.post('/tailored-cvs/:tailoredCvId/optimize', verifyToken, tailoringController.optimizeTailoredCV);

module.exports = router;
