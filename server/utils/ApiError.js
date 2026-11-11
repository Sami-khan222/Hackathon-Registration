/** Operational error with an HTTP status; the error middleware turns it into a JSON response. */
class ApiError extends Error {
  constructor(statusCode, message, errors = null, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // field-level validation messages
    this.extra = extra;   // e.g. { retryAfter: 30, code: 'UNVERIFIED' }
    this.isOperational = true;
  }
}
module.exports = ApiError;
