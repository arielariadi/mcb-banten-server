import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Submission from '../models/submissionModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

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

// @desc Get task by id
// @route GET /v1/user/task/:id
// @access Private
const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 'fail', message: 'ID tidak valid!' });
  }

  const task = await Task.findById(req.params.id).lean();

  if (!task) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tidak ada tugas!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil tugas',
    data: task,
  });
});

// @desc Submit completed task
// @route POST /v1/user/submit-task
// @access Private
const submitCompletedTask = asyncHandler(async (req, res) => {
  const { user, task, description } = req.body;
  const taskScreenshot = req.file.path;

  if (!user || !task || !taskScreenshot || !description) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data!' });
  }

  const submission = await Submission.create({
    user,
    task,
    taskScreenshot,
    description,
  });

  if (submission) {
    return res.status(201).json({
      status: 'success',
      message: 'Tugas selesai ditambahkan!',
      data: submission,
    });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Tidak dapat menambahkan tugas!',
    });
  }
});

export { getAllTasks, getTaskById, submitCompletedTask };
