const { env } = require('../config/env');

const notFound = (req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

/** Central error handler: converts every failure into the same JSON shape without leaking internals. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message;
  let errors = err.errors || null;

  if (err.name === 'ValidationError' && err.errors && !err.isOperational) {
    status = 422;
    message = 'Please fix the highlighted fields.';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'This record already exists.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large.';
  } else if (!err.isOperational) {
    status = 500;
    message = 'Something went wrong on our side. Please try again.';
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(err.extra || {}),
    ...(!env.isProduction && status === 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
