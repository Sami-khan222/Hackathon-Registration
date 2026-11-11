const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME, verifyToken } = require('../utils/token');
const { env } = require('../config/env');

const isAdminEmail = (email) => env.adminEmails.includes(String(email).toLowerCase());

/** Private routes ke liye. JWT HTTP-only cookie se padhta hai. */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.[COOKIE_NAME] || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) throw new ApiError(401, 'Please log in to continue.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isVerified) throw new ApiError(401, 'Your session is no longer valid. Please log in again.');

  req.user = user;
  next();
});

/** `protect` ke baad lagta hai. Sirf ADMIN_EMAILS wale email pass honge. */
const adminOnly = (req, _res, next) => {
  if (!isAdminEmail(req.user.email)) throw new ApiError(403, 'Admin access only.');
  next();
};

module.exports = { protect, adminOnly, isAdminEmail };