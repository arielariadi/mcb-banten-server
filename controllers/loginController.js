import { loginService, refreshTokenService } from '../services/loginService.js';
import asyncHandler from 'express-async-handler';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginService(email, password);
  res
    .status(200)
    .json({ status: 'success', message: 'Login success!', token: token });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const newToken = await refreshTokenService(token);
  res.status(200).json({
    status: 'success',
    message: 'Refresh token success!',
    newToken: newToken,
  });
});

export { login, refreshToken };
