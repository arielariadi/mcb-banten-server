import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' });
};

export default generateToken;
