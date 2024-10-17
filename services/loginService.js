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

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new Error('Incorrect password!');
  }

  const token = generateToken(existingUser);
  return {
    token,
    user: {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    },
  };
});

const refreshTokenService = asyncHandler(async (oldToken) => {
  const decodedToken = verifyToken(oldToken);
  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new Error('User not found!');
  }

  const newToken = generateToken(user);
  return {
    token: newToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
});

export { loginService, refreshTokenService };
