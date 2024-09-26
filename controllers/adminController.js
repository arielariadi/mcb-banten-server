import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Submission from '../models/submissionModel.js';
import asyncHandler from 'express-async-handler';

// @desc Get all users
// @route GET /v1/admin/list-users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  res.status(200).json({
    status: 'success',
    message: 'Sukses mengambil semua user',
    data: users,
  });
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

// @desc Get all submissions
// @route GET /v1/admin/list-submissions
// @access Private/Admin
const getAllSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Hitung jumlah total submissions
  const totalSubmissions = await Submission.countDocuments();
  const totalPage = Math.ceil(totalSubmissions / limit);

  // Ambil submissions dengan pagination
  const submissions = await Submission.find().skip(offset).limit(limit).lean();

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

export {
  getAllUsers,
  createNewTask,
  getAllSubmissions,
  acceptSubmission,
  rejectSubmission,
};
