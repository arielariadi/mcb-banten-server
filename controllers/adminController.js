import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  res
    .status(200)
    .json({ status: 'success', message: 'Success get all users', data: users });
});

export { getAllUsers };
