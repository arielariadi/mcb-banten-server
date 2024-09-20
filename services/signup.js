import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

async function createUser(userData) {
  const {
    username,
    email,
    password,
    noDana,
    alamat,
    jenisKelamin,
    tanggalLahir,
  } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = new User({
    username,
    email,
    password: hashedPassword,
    noDana,
    alamat,
    jenisKelamin,
    tanggalLahir,
    totalReward: 0,
    role: 'user',
  });

  const savedUser = await createdUser.save();
  return savedUser;
}

export { createUser };
