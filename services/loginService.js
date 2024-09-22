import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/jwtUtil.js';

const loginService = async (email, password) => {
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error('User does not exist!');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new Error('Incorrect password!');
    }

    const token = generateToken(existingUser);
    return token;
  } catch (error) {
    throw new Error('Invalid credentials!');
  }
};

export default loginService;
