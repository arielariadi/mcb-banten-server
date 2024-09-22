import express from 'express';
const router = express.Router();
import login from '../controllers/loginController.js';

router.post('/', login);

export default router;
