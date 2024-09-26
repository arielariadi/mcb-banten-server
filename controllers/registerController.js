import User from '../models/userModel.js';
import createUserService from '../services/createUserService.js';
import asyncHandler from 'express-async-handler';

const createNewUser = asyncHandler(async (req, res) => {
  const { username, email, noHp, ...userData } = req.body;

  // Confirm required data
  if (!userData) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data!' });
  }

  // Check for duplicate username
  const duplicateUsername = await User.findOne({ username }).lean().exec();
  if (duplicateUsername) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Username sudah digunakan!' });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Email sudah digunakan!' });
  }

  // Check for duplicate noHp
  const duplicateNoHp = await User.findOne({ noHp }).lean().exec();
  if (duplicateNoHp) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Nomor HP sudah digunakan!' });
  }

  // Create and store new user
  const user = await createUserService({
    username,
    email,
    noHp,
    ...userData,
  });
  if (user) {
    res.status(201).json({
      status: 'success',
      message: `New user ${user.username} created`,
      user: user,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data received!' });
  }
});

export default createNewUser;
