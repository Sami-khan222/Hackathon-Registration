/** Every successful response has the same shape: { success, message, data }. */
const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

module.exports = { sendSuccess };
