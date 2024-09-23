import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/adminMiddleware.js';
import { getAllUsers } from '../controllers/adminController.js';

// ENDPOINT INI HANYA BISA DIAKSES OLEH ADMIN SAJA

// Endpoint untuk mendapatkan semua user
router.get('/list-users', authenticateToken, isAdmin, getAllUsers);

export default router;
