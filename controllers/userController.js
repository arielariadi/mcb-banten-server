import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import asyncHandler from 'express-async-handler';

// @desc Get all tasks
// @route GET /v1/user/list-tasks
// @access Private
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().lean();

  if (!tasks) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tidak ada tugas!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua tugas',
    data: tasks,
  });
});

export { getAllTasks };
