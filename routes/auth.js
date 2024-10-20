import express from 'express';
const router = express.Router();
import { login, refreshToken } from '../controllers/loginController.js';
import createNewUser from '../controllers/registerController.js';

// Endpoint register user
router.post('/register', createNewUser);

// Endpoint login user
router.post('/login', login);

// Endpoint refresh token
router.post('/refresh-token', refreshToken);

export default router;
