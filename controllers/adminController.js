import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Submission from '../models/submissionModel.js';
import Withdrawal from '../models/withdrawalModel.js';

import asyncHandler from 'express-async-handler';

import fs from 'fs';
import path from 'path';

// @desc Create new Task
// @route POST /v1/admin/create-task
// @access Private/Admin
const createNewTask = asyncHandler(async (req, res) => {
  const { title, description, socialMediaUrl, reward } = req.body;

  // Ambil nama file dari req.file
  const image = req.file.path.replace(/^.*[\\\/]/, '');
  const relativeImagePath = `images/taskImages/${image}`; // jalur relatif gambar

  // Confirm data
  if (
    !title ||
    !description ||
    !relativeImagePath ||
    !socialMediaUrl ||
    !reward
  ) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Tolong isi semua data!' });
  }

  // Check for duplicate title
  const duplicateTitle = await Task.findOne({ title }).lean().exec();
  if (duplicateTitle) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Title sudah digunakan!' });
  }

  // Create and store new task
  const task = await Task.create({
    title,
    description,
    image: relativeImagePath,
    socialMediaUrl,
    reward,
    createdBy: req.user.id,
  });

  if (task) {
    // Created
    return res.status(201).json({
      status: 'success',
      message: 'Tugas berhasil dibuat',
      data: task,
    });
  } else {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Task gagal dibuat!' });
  }
});

// @desc Delete task
// @route DELETE /v1/admin/delete-task
// @access Private/Admin
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(404).json({
      status: 'fail',
      message: 'ID tidak ditemukan!',
    });
  }

  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(404).json({
      status: 'fail',
      message: 'Tugas tidak ditemukan!',
    });
  }

  // Path lengkap gambar yang akan dihapus
  const imagePath = path.join(
    'public',
    'images',
    'taskImages',
    path.basename(task.image),
  );

  // Hapus gambar jika ada
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Gagal menghapus gambar!:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'Gagal menghapus gambar tugas',
      });
    }
  });

  // Hapus task
  await task.deleteOne();

  const reply = `Tugas dengan title '${task.title}' dengan ID '${task._id}' telah dihapus`;

  res.status(200).json({ status: 'success', message: reply });
});

// @desc Get all submissions
// @route GET /v1/admin/list-submissions
// @access Private/Admin
const getAllSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Hitung jumlah total submission
  const totalSubmissions = await Submission.countDocuments();
  const totalPage = Math.ceil(totalSubmissions / limit);

  // Ambil submissions dengan pagination
  const submissions = await Submission.find()
    .sort({ submittedAt: 1 })
    .skip(offset)
    .limit(limit)
    .populate('user', 'username') // mengambil value field 'username' dari 'user'
    .populate('task', 'title description socialMediaUrl taskScreenshot')
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua submissions',
    data: submissions,
    pagination: {
      totalSubmissions,
      currentPage: page,
      totalPage,
    },
  });
});

// @desc Accept submission
// @route PATCH /v1/admin/accept-submission
// @access Private/Admin
const acceptSubmission = asyncHandler(async (req, res) => {
  const { id, rejectedReason } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'ID tidak ditemukan!' });
  }

  // Cari submission berdasarkan ID
  const submission = await Submission.findById(id).populate('task user').exec();

  if (!submission) {
    return res.status(404).json({
      status: 'fail',
      message: 'Submission tidak ditemukan!',
    });
  }

  if (submission.status === 'accepted' || submission.status === 'rejected') {
    return res.status(400).json({
      status: 'fail',
      message: 'Submission sudah diproses sebelumnya!',
    });
  }

  // Update status submission dan tambahkan validatedBy serta validatedAt
  submission.status = 'accepted';
  submission.validatedBy = req.user.id;
  submission.validatedAt = Date.now();
  submission.rejectedReason = rejectedReason;

  // Simpan submission yang telah diperbarui
  const updatedSubmission = await submission.save();

  // Tambahkan reward dari task ke totalReward user
  const user = await User.findById(submission.user);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User tidak ditemukan!',
    });
  }

  // Tambahkan reward dari task ke totalReward user
  user.totalReward = (user.totalReward || 0) + submission.task.reward;

  // Simpan perubahan pada user
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Submission diterima dan total reward user telah diperbarui!',
    data: updatedSubmission,
  });
});

// @desc Reject submission
// @route PATCH /v1/admin/reject-submission
// @access Private/Admin
const rejectSubmission = asyncHandler(async (req, res) => {
  const { id, rejectedReason } = req.body;

  if (!id) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'ID tidak ditemukan!' });
  }

  // Cari submission berdasarkan ID
  const submission = await Submission.findById(id).populate('task user').exec();

  if (!submission) {
    return res.status(404).json({
      status: 'fail',
      message: 'Submission tidak ditemukan!',
    });
  }

  // Update status submission dan tambahkan validatedBy serta validatedAt
  submission.status = 'rejected';
  submission.validatedBy = req.user.id;
  submission.validatedAt = Date.now();
  submission.rejectedReason = rejectedReason;

  // Simpan submission yang telah diperbarui
  const updatedSubmission = await submission.save();

  res.status(200).json({
    status: 'success',
    message: 'Submission ditolak!',
    data: updatedSubmission,
  });
});

const getAllWithdrawals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Hitung jumlah total submission
  const totalWithdrawals = await Withdrawal.countDocuments();
  const totalPage = Math.ceil(totalWithdrawals / limit);

  // Ambil withdrawal dengan pagination
  const withdrawals = await Withdrawal.find()
    .sort({ requestedAt: 1 })
    .skip(offset)
    .limit(limit)
    .populate('user', 'username alamat')
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua withdrawal',
    data: withdrawals,
    pagination: {
      totalWithdrawals,
      currentPage: page,
      totalPage,
    },
  });
});

// @desc Accept request withdrawal
// @route PATCH /v1/admin/accept-withdrawal
// @access Private/Admin
const acceptRequestWithdrawal = asyncHandler(async (req, res) => {
  const { id, rejectedReason } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'ID tidak ditemukan!' });
  }

  // Cari withdrawal berdasarkan ID
  const withdrawal = await Withdrawal.findById(id).populate('user').exec();

  if (!withdrawal) {
    return res.status(404).json({
      status: 'fail',
      message: 'Request penarikan tidak ditemukan!',
    });
  }

  // Periksa apakah withdrawal sudah diterima atau ditolak
  if (withdrawal.status === 'accepted' || withdrawal.status === 'rejected') {
    return res.status(400).json({
      status: 'fail',
      message: 'Penarikan sudah diproses sebelumnya!',
    });
  }

  // Ambil user dari withdrawal
  const user = await User.findById(withdrawal.user);

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User tidak ditemukan!',
    });
  }

  // Pastikan user memiliki cukup totalReward untuk penarikan
  if (user.totalReward < withdrawal.amount) {
    return res.status(400).json({
      status: 'fail',
      message: 'User tidak memiliki cukup reward untuk penarikan!',
    });
  }

  // Update status withdrawal dan tambahkan validatedBy serta validatedAt
  withdrawal.status = 'accepted';
  withdrawal.validatedBy = req.user.id;
  withdrawal.validatedAt = Date.now();
  withdrawal.rejectedReason = rejectedReason;

  // Kurangi total reward user berdasarkan amount
  user.totalReward -= withdrawal.amount;

  // Simpan perubahan pada user
  await user.save();

  // Simpan withdrawal yang telah diperbarui
  const updatedWithdrawal = await withdrawal.save();

  if (updatedWithdrawal) {
    return res.status(200).json({
      status: 'success',
      message: 'Penarikan diterima dan total reward user telah diperbarui!',
      data: updatedWithdrawal,
    });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Penarikan gagal diterima!',
    });
  }
});

// @desc Reject request withdrawal
// @route PATCH /v1/admin/reject-withdrawal
// @access Private/Admin
const rejectRequestWithdrawal = asyncHandler(async (req, res) => {
  const { id, rejectedReason } = req.body;

  if (!id) {
    return res.status(404).json({
      status: 'fail',
      message: 'ID tidak ditemukan!',
    });
  }

  // Cari withdrawal berdasarkan ID
  const withdrawal = await Withdrawal.findById(id).populate('user').exec();

  if (!withdrawal) {
    return res.status(404).json({
      status: 'fail',
      message: 'Request penarikan tidak ditemukan!',
    });
  }

  // Periksa apakah withdrawal sudah diterima atau ditolak
  if (withdrawal.status === 'accepted' || withdrawal.status === 'rejected') {
    return res.status(400).json({
      status: 'fail',
      message: 'Penarikan sudah diproses sebelumnya!',
    });
  }

  // Update status withdrawal dan tambahkan rejectedBy serta rejectedAt
  withdrawal.status = 'rejected';
  withdrawal.validatedBy = req.user.id;
  withdrawal.validatedAt = Date.now();
  withdrawal.rejectedReason = rejectedReason;

  // Simpan withdrawal yang telah diperbarui
  const updatedWithdrawal = await withdrawal.save();

  if (updatedWithdrawal) {
    return res.status(200).json({
      status: 'success',
      message: 'Request penarikan ditolak!',
      data: updatedWithdrawal,
    });
  } else {
    return res.status(400).json({
      status: 'fail',
      message: 'Request penarikan gagal ditolak!',
    });
  }
});

export {
  createNewTask,
  getAllSubmissions,
  acceptSubmission,
  rejectSubmission,
  getAllWithdrawals,
  acceptRequestWithdrawal,
  rejectRequestWithdrawal,
  deleteTask,
};
