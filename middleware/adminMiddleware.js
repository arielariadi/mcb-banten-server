// Untuk mengecek apakah user rolenya admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied! Only admins can access this resource!',
    });
  }
  next();
};

export default isAdmin;
