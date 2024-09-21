import User from '../models/userModel.js';
import createUserService from '../services/createUserService.js';
import asyncHandler from 'express-async-handler';

const createNewUser = asyncHandler(async (req, res) => {
  const { username, email, noDana, ...userData } = req.body;

  // Confirm required data
  if (!userData) {
    return res.status(400).json({ message: 'Tolong isi semua data!' });
  }

  // Check for duplicate username
  const duplicateUsername = await User.findOne({ username }).lean().exec();
  if (duplicateUsername) {
    return res.status(409).json({ message: 'Username sudah digunakan!' });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res.status(409).json({ message: 'Email sudah digunakan!' });
  }

  // Check for duplicate noDana
  const duplicateNoDana = await User.findOne({ noDana }).lean().exec();
  if (duplicateNoDana) {
    return res.status(409).json({ message: 'Nomor Dana sudah digunakan!' });
  }

  // Create and store new user
  const user = await createUserService({
    username,
    email,
    noDana,
    ...userData,
  });
  if (user) {
    res
      .status(201)
      .json({ user: user, message: `New user ${user.username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user data received!' });
  }
});

export default createNewUser;
