import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import { getAllTasks } from '../controllers/userController.js';

// // Endpoint untuk mendapatkan semua tugas
router.get('/list-tasks', authenticateToken, getAllTasks);

export default router;
