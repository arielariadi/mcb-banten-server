import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

async function createUserService(userData) {
  const {
    username,
    email,
    password,
    noHp,
    alamat,
    jenisKelamin,
    tanggalLahir,
  } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = new User({
    username,
    email,
    password: hashedPassword,
    noHp,
    alamat,
    jenisKelamin,
    tanggalLahir,
    totalReward: 0,
    role: 'user',
  });

  const savedUser = await createdUser.save();
  return savedUser;
}

export default createUserService;
