import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/adminMiddleware.js';
import taskImage from '../middleware/taskImageMiddleware.js';
import { getAllUsers, createNewTask } from '../controllers/adminController.js';

// ENDPOINT INI HANYA BISA DIAKSES OLEH ADMIN SAJA

// Endpoint untuk mendapatkan semua user
router.get('/list-users', authenticateToken, isAdmin, getAllUsers);

// Endpoint untuk membuat task
router.post(
  '/create-task',
  authenticateToken,
  isAdmin,
  taskImage.single('image'),
  createNewTask,
);

export default router;
