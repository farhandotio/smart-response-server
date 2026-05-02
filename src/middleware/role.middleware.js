import AppError from '../utils/AppError.js';

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Role: ${req.user.role} is not allowed to access this resource`, 403)
      );
    }

    next();
  };
};

export default authorize;
