import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/jwtUtil.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const loginService = asyncHandler(async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error('User does not exist!');
  }

  const isPasswordValid = bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new Error('Incorrect password!');
  }

  const token = generateToken(existingUser);
  return token;
});

const refreshTokenService = asyncHandler(async (oldToken) => {
  const decodedToken = verifyToken(oldToken);
  const user = User.findById(decodedToken._id);

  if (!user) {
    throw new Error('User not found!');
  }

  const newToken = generateToken(user);
  return newToken;
});

export { loginService, refreshTokenService };
