import express from 'express';
const router = express.Router();
import createNewUser from '../controllers/registerController.js';

router.post('/', createNewUser);

export default router;
