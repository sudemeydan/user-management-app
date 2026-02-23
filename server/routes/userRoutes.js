const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware'); 

router.post('/register', userController.createUser);

router.post('/login', userController.login);

router.get('/', authMiddleware, userController.getUsers); 

router.put('/:id', authMiddleware, userController.updateUser);

router.post('/refresh', userController.refresh);

router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router; 