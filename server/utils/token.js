const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const signToken = (userId) => jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

/**
 * HTTP-only cookie: JavaScript can't read it, which blocks token theft via XSS.
 * Production uses SameSite=None + Secure so the Vercel frontend can call the Render API.
 */
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/',
});

const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SEVEN_DAYS_MS });
const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());

module.exports = { COOKIE_NAME, signToken, verifyToken, setAuthCookie, clearAuthCookie };
