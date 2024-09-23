import loginService from '../services/loginService.js';
import asyncHandler from 'express-async-handler';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginService(email, password);
  res.status(200).res.json({ message: 'Login success!', token: token });
});

export default login;
