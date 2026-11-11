require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL', 'EMAIL_USER', 'EMAIL_PASS'];

/** Fail fast with a readable message instead of crashing later with a cryptic one. */
const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. See server/.env.example`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }
};

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '7d',
  // CLIENT_URL may hold several comma-separated origins (e.g. production + preview)
  clientOrigins: (process.env.CLIENT_URL || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean),
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};

module.exports = { env, validateEnv };
