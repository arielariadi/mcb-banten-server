import { loginService, refreshTokenService } from '../services/loginService.js';
import asyncHandler from 'express-async-handler';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await loginService(email, password);
  res.status(200).json({
    status: 'success',
    message: 'Login success!',
    token: token,
    user: user,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const { token: newToken, user } = await refreshTokenService(token);
  res.status(200).json({
    status: 'success',
    message: 'Refresh token success!',
    token: newToken,
    user: user,
  });
});

export { login, refreshToken };
