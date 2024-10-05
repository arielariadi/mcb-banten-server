import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Submission from '../models/submissionModel.js';
import Withdrawal from '../models/withdrawalModel.js';

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc Get all user submissions history
// @route GET /v1/user/submissions-history
// @access Private
const getSubmissionsHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  const totalSubmissions = await Submission.countDocuments({ user: userId });
  const totalPage = Math.ceil(totalSubmissions / limit);

  const submissions = await Submission.find({ user: userId })
    .sort({ submittedAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  if (!submissions) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Riwayat submission tidak ditemukan!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua riwayat submission',
    data: submissions,
    pagination: {
      totalSubmissions,
      currentPage: page,
      totalPage,
    },
  });
});

// @desc Get all user withdrawals history
// @route GET /v1/user/withdrawals-history
// @access Private
const getWithdrawalsHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  const totalWithdrawals = await Withdrawal.countDocuments({ user: userId });
  const totalPage = Math.ceil(totalWithdrawals / limit);

  const withdrawals = await Withdrawal.find({ user: userId })
    .sort({
      requestedAt: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  if (!withdrawals) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Riwayat penarikan tidak ditemukan!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua riwayat penarikan',
    data: withdrawals,
    pagination: {
      totalWithdrawals,
      currentPage: page,
      totalPage,
    },
  });
});

// @desc Get all tasks
// @route GET /v1/user/list-tasks
// @access Private
const getAllTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Hitung jumlah total tasks
  const totalTasks = await Task.countDocuments();
  const totalPage = Math.ceil(totalTasks / limit);

  const tasks = await Task.find()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  if (!tasks) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tidak ada tugas!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua tugas',
    data: tasks,
    pagination: {
      totalTasks,
      currentPage: page,
      totalPage,
    },
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
  const { task, description } = req.body;

  // Ambil nama file dari req.file
  const taskScreenshot = req.file.path.replace(/^.*[\\\/]/, '');
  const relativeImagePath = `images/proofOfTasks/${taskScreenshot}`; // jalur relatif gambar

  if (!task || !relativeImagePath || !description) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data!' });
  }

  // Dapatkan user dari token autentikasi
  const user = await User.findById(req.user.id);
  if (!user) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'User tidak ditemukan!' });
  }

  const submission = await Submission.create({
    user: user.id,
    task,
    taskScreenshot: relativeImagePath,
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

// @desc Request withdrawal
// @route POST /v1/user/request-withdrawal
// @access Private
const requestWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalMethod, withdrawalMethodNumber, amount } = req.body;

  if (!withdrawalMethod || !withdrawalMethodNumber || !amount) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tolong isi semua data!',
    });
  }

  // Dapatkan user dari token autentikasi
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User tidak ditemukan!',
    });
  }

  if (user.totalReward < 250000) {
    return res.status(400).json({
      status: 'fail',
      message: 'Anda harus memiliki minimal 250.000 reward!',
    });
  }

  if (amount > user.totalReward || amount <= 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Jumlah penarikan tidak valid!',
    });
  }

  const withdrawal = await Withdrawal.create({
    user: user.id,
    withdrawalMethod,
    withdrawalMethodNumber,
    amount,
  });
  if (withdrawal) {
    return res.status(201).json({
      status: 'success',
      message: `Request penarikan uang dengan jumlah ${amount} berhasil dilakukan`,
      data: withdrawal,
    });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Gagal melakukan request penarikan uang!',
    });
  }
});

export {
  getAllTasks,
  getTaskById,
  submitCompletedTask,
  requestWithdrawal,
  getSubmissionsHistory,
  getWithdrawalsHistory,
};
