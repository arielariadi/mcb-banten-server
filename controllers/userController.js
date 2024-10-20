import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Submission from '../models/submissionModel.js';
import Withdrawal from '../models/withdrawalModel.js';

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const sanitize = (input) =>
  sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });

// @desc Get all users
// @route GET /v1/user/list-users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Hitung jumlah total user
  const totalUsers = await User.countDocuments();
  const totalPage = Math.ceil(totalUsers / limit);

  const users = await User.find().select('-password').lean();

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua user',
    data: users,
    pagination: {
      totalUsers,
      currentPage: page,
      totalPage,
    },
  });
});

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
    .populate('task', 'title description image')
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

  const tasks = await Task.find().skip(offset).limit(limit).lean();

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

  // Validasi karakter
  const validInputRegex = /^[a-zA-Z0-9\s.,!?'-]*$/;

  if (
    !task ||
    !description ||
    !validInputRegex.test(task) ||
    !validInputRegex.test(description)
  ) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data dengan benar!' });
  }

  // Ambil nama file dari req.file
  const taskScreenshot = req.file.path.replace(/^.*[\\\/]/, '');
  const relativeImagePath = `images/proofOfTasks/${taskScreenshot}`; // jalur relatif gambar

  if (!relativeImagePath) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Gambar tidak ditemukan!' });
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

  // Validsai karakter
  const validInputRegex = /^[a-zA-Z0-9\s.,!?'-]*$/;
  const validMethodNumberRegex = /^[0-9-]+$/;
  const validAmountRegex = /^[0-9]+$/;

  if (
    !withdrawalMethod ||
    !withdrawalMethodNumber ||
    !amount ||
    !validInputRegex.test(withdrawalMethod) ||
    !validMethodNumberRegex.test(withdrawalMethodNumber) ||
    !validAmountRegex.test(amount)
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Tolong isi semua data dengan benar!',
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

// @desc Update user profile
// @route PATCH /v1/user/update-profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // Validasi input
  const schema = Joi.object({
    username: Joi.string().min(3).max(30),
    alamat: Joi.string().max(100),
    jenisKelamin: Joi.string().valid('Laki-laki', 'Perempuan'),
    tanggalLahir: Joi.date().iso().max('now'),
    noHp: Joi.string().pattern(/^[0-9]{10,14}$/),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }

  const { username, alamat, jenisKelamin, tanggalLahir, noHp } = value;

  // Dapatkan user dari token autentikasi
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User tidak ditemukan!',
    });
  }

  if (username) user.username = sanitize(username);
  if (alamat) user.alamat = sanitize(alamat);
  if (jenisKelamin) user.jenisKelamin = jenisKelamin;
  if (tanggalLahir) user.tanggalLahir = tanggalLahir;
  if (noHp) user.noHp = noHp;

  const updatedUser = await user.save();

  // Select specific field to return
  const userToReturn = await User.findById(updatedUser._id).select(
    'username alamat jenisKelamin tanggalLahir noHp',
  );

  if (updatedUser) {
    return res.status(200).json({
      status: 'success',
      message: 'Profil user diperbarui!',
      data: userToReturn,
    });
  } else {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memperbarui profil user.',
    });
  }
});

export {
  getAllUsers,
  getAllTasks,
  getTaskById,
  submitCompletedTask,
  requestWithdrawal,
  getSubmissionsHistory,
  getWithdrawalsHistory,
  updateUserProfile,
};
