import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import { getAllTasks, getTaskById } from '../controllers/userController.js';

// Endpoint untuk mendapatkan semua tugas
router.get('/list-tasks', authenticateToken, getAllTasks);

// Endpoint untuk mendapatkan tugas berdasarkan ID
router.get('/task/:id', authenticateToken, getTaskById);

export default router;
