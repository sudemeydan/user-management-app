const express = require('express');
const router = express.Router();
const atsController = require('../controllers/atsController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/cvs/:cvId/optimize', verifyToken, atsController.optimizeCVFormat);
router.get('/cvs/:cvId/ats-status', verifyToken, atsController.getATSStatus);

module.exports = router;
