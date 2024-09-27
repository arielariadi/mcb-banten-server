import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getAllTasks,
  getTaskById,
  submitCompletedTask,
  requestWithdrawal,
} from '../controllers/userController.js';

import proofOfTasks from '../middleware/proofOfTaskMiddleware.js';

// Endpoint untuk mendapatkan semua tugas
router.get('/list-tasks', authenticateToken, getAllTasks);

// Endpoint untuk mendapatkan tugas berdasarkan ID
router.get('/task/:id', authenticateToken, getTaskById);

// Endpoint untuk mengirim tugas
router.post(
  '/submit-task',
  authenticateToken,
  proofOfTasks.single('taskScreenshot'),
  submitCompletedTask,
);

// Endpoint untuk melakukan request penarikan pada user
router.post('/request-withdrawal', authenticateToken, requestWithdrawal);
export default router;
