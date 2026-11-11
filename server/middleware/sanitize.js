/**
 * Defends against NoSQL operator injection ({"email": {"$gt": ""}}) by removing keys that start with "$"
 * or contain "." from req.body / req.query / req.params, and strips control characters from strings.
 * Written inline because express-mongo-sanitize is unmaintained.
 */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const sanitizeValue = (value) => {
  if (typeof value === 'string') return value.replace(CONTROL_CHARS, '');
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, val]) => [key, sanitizeValue(val)])
    );
  }
  return value;
};

module.exports = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) Object.defineProperty(req, 'query', { value: sanitizeValue(req.query), writable: true, configurable: true });
  next();
};
