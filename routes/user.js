import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getAllTasks,
  getTaskById,
  submitCompletedTask,
  requestWithdrawal,
  getSubmissionsHistory,
  getWithdrawalsHistory,
} from '../controllers/userController.js';

import proofOfTasks from '../middleware/proofOfTaskMiddleware.js';

// Endpoint untuk mendapatkan semua user
router.get('/users-list', authenticateToken, getAllUsers);

// Endpoint untuk mendapatkan riwayat submission (untuk dashboard user)
router.get('/submissions-history', authenticateToken, getSubmissionsHistory);

// Endpoint untuk mendapatkan riwayat penarikan (untuk dashboard user)
router.get('/withdrawals-history', authenticateToken, getWithdrawalsHistory);

// Endpoint untuk mendapatkan semua tugas
router.get('/tasks-list', authenticateToken, getAllTasks);

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
