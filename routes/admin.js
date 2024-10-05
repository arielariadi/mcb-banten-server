import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/adminMiddleware.js';
import taskImage from '../middleware/taskImageMiddleware.js';
import {
  getAllUsers,
  createNewTask,
  getAllSubmissions,
  acceptSubmission,
  rejectSubmission,
  getAllWithdrawals,
  acceptRequestWithdrawal,
  rejectRequestWithdrawal,
  deleteTask,
} from '../controllers/adminController.js';

// ENDPOINT INI HANYA BISA DIAKSES OLEH ADMIN SAJA

// Endpoint untuk mendapatkan semua user
router.get('/users-list', authenticateToken, isAdmin, getAllUsers);

// Endpoint untuk membuat task
router.post(
  '/create-task',
  authenticateToken,
  isAdmin,
  taskImage.single('image'),
  createNewTask,
);

// Endpoint untuk mendapatkan semua submissions
router.get('/submission-list', authenticateToken, isAdmin, getAllSubmissions);

// Endpoint untuk menerima submission user
router.patch(
  '/accept-submission',
  authenticateToken,
  isAdmin,
  acceptSubmission,
);

// Endpoint untuk menolak submission user
router.patch(
  '/reject-submission',
  authenticateToken,
  isAdmin,
  rejectSubmission,
);

// Endpoint untuk mendapatkan semua withdrawal
router.get('/withdrawal-list', authenticateToken, isAdmin, getAllWithdrawals);

// Endpoint untuk menerima request withdrawal user
router.patch(
  '/accept-withdrawal',
  authenticateToken,
  isAdmin,
  acceptRequestWithdrawal,
);

// Endpoint untuk menolak request withdrawal user
router.patch(
  '/reject-withdrawal',
  authenticateToken,
  isAdmin,
  rejectRequestWithdrawal,
);

// Endpoint untuk menghapus task
router.delete('/delete-task', authenticateToken, isAdmin, deleteTask);

export default router;
