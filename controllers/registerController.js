import User from '../models/userModel.js';
import createUserService from '../services/createUserService.js';
import asyncHandler from 'express-async-handler';

import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const sanitize = (input) =>
  sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });

const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .pattern(/^[a-zA-Z0-9 ]+$/),
  email: Joi.string().email().required(),
  noHp: Joi.string()
    .pattern(/^[0-9]{10,14}$/)
    .required(),
  password: Joi.string().min(6).required(),
  alamat: Joi.string().max(100),
  jenisKelamin: Joi.string().valid('Laki-laki', 'Perempuan'),
  tanggalLahir: Joi.date().iso(),
});

const createNewUser = asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { username, email, noHp, ...userData } = value;

  // Sanitize input
  const sanitizedUsername = sanitize(username);
  const sanitizedEmail = sanitize(email);

  // Check for duplicate username
  const duplicateUsername = await User.findOne({ username: sanitizedUsername })
    .lean()
    .exec();
  if (duplicateUsername) {
    return res
      .status(409)
      .json({ status: 'fail', message: 'Username sudah digunakan!' });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email: sanitizedEmail })
    .lean()
    .exec();
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
    username: sanitizedUsername,
    email: sanitizedEmail,
    noHp,
    ...userData,
  });
  if (user) {
    res.status(201).json({
      status: 'success',
      message: `New user ${user.username} created`,
      user: {
        username: user.username,
        email: user.email,
        noHp: user.noHp,
        alamat: user.alamat,
        jenisKelamin: user.jenisKelamin,
        tanggalLahir: user.tanggalLahir,
      },
    });
  } else {
    res.status(400).json({ message: 'Invalid user data received!' });
  }
});

export default createNewUser;
