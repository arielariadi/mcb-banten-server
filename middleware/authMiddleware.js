import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res
      .status(401)
      .json({ status: 'fail', message: 'Unauthorized: Missing token!' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ status: 'fail', message: 'Unauthorized: Invalid token format!' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ status: 'fail', message: 'Unauthorized: Invalid token!' });
    }

    req.user = user;
    next();
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
};

export { authenticateToken, verifyToken };
