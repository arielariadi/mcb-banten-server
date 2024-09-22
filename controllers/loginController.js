import loginService from '../services/loginService.js';
import asyncHandler from 'express-async-handler';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginService(email, password);
  res.json({ token: token });
});

export default login;
