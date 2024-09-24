import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import asyncHandler from 'express-async-handler';

// @desc Get all users
// @route GET /v1/admin/list-users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  res
    .status(200)
    .json({ status: 'success', message: 'Success get all users', data: users });
});

// @desc Create new Task
// @route POST /v1/admin/create-task
// @access Private/Admin
const createNewTask = asyncHandler(async (req, res) => {
  const { title, description, socialMediaUrl, reward } = req.body;
  const image = req.file.path;

  // Confirm data
  if (!title || !description || !image || !socialMediaUrl || !reward) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data!' });
  }

  // Check for duplicate title
  const duplicateTtile = await Task.findOne({ title }).lean().exec();
  if (duplicateTtile) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Title sudah digunakan!' });
  }

  // Create and store new task
  const task = await Task.create({
    title,
    description,
    image,
    socialMediaUrl,
    reward,
    createdBy: req.user.id,
  });

  if (task) {
    // Created
    return res
      .status(201)
      .json({ status: 'success', message: 'Task created!', data: task });
  } else {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Task gagal dibuat!' });
  }
});

export { getAllUsers, createNewTask };
