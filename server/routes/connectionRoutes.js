const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tüm işlemlerde giriş yapmış olmak (Token) zorunlu
router.post('/request', authMiddleware, connectionController.sendRequest);
router.put('/accept/:id', authMiddleware, connectionController.acceptRequest);
router.delete('/remove/:id', authMiddleware, connectionController.rejectOrRemoveRequest);

module.exports = router;