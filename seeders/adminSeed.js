import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';

const createAdminAccount = asyncHandler(async () => {
  const existingAdmin = await User.findOne({ email: 'mcbadmin@gmail.com' });

  if (!existingAdmin) {
    const newAdmin = new User({
      username: 'MCB Admin',
      email: 'mcbadmin@gmail.com',
      password: await bcrypt.hash('mcbadmin123', 10),
      role: 'admin',
    });
    await newAdmin.save();
    console.log('Akun admin berhasil dibuat');
  } else {
    console.log('Akun admin sudah ada!');
  }
});

export default createAdminAccount;
