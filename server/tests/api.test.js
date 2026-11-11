/**
 * End-to-end API test against a real MongoDB (set TEST_MONGO_URI). The only stubbed piece is the
 * Nodemailer transport, which records outgoing mail so the test can read OTPs without Gmail.
 * Run:  TEST_MONGO_URI=mongodb://127.0.0.1:27017/matrucare_test npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/matrucare_test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.EMAIL_USER = 'matrucareai@gmail.com';
process.env.EMAIL_PASS = 'unused';
process.env.NODE_ENV = 'test';

// --- capture outgoing email instead of hitting Gmail ---
const outbox = { otp: [], confirmation: [], contact: [] };
const emailPath = require.resolve('../services/emailService');
require.cache[emailPath] = {
  id: emailPath, filename: emailPath, loaded: true,
  exports: {
    sendOtpEmail: async (m) => { outbox.otp.push(m); },
    sendRegistrationConfirmationEmail: async (m) => { outbox.confirmation.push(m); },
    sendContactEmail: async (m) => { outbox.contact.push(m); },
    verifyEmailTransport: async () => {},
  },
};

const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const HackathonRegistration = require('../models/HackathonRegistration');

let server; let base; let cookie = '';
const lastOtp = () => outbox.otp[outbox.otp.length - 1].otp;

const call = async (method, path, body, { withCookie = true } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(withCookie && cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, json: await res.json(), setCookie, headers: res.headers };
};

const EMAIL = 'asha.verma@example.com';
const PASSWORD = 'Strong1Pass';
const registration = (overrides = {}) => ({
  fullName: 'Asha Verma', email: EMAIL, mobileNumber: '9876543210',
  collegeName: 'Delhi Technological University', course: 'B.Tech', branch: 'CSE', yearOfStudy: '3rd Year',
  domain: 'Healthcare Tech', projectName: 'Prenatal Risk Tracker',
  pptLink: 'https://drive.google.com/file/d/abc/view', prototypeLink: 'https://github.com/asha/prototype',
  demoVideoLink: '', teamSize: 1, teamMembers: [], ...overrides,
});

test.before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([User.init(), HackathonRegistration.init()]);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test('security headers are set (helmet)', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
  assert.ok(r.headers.get('x-content-type-options'));
});

test('signup rejects invalid input with field errors', async () => {
  const r = await call('POST', '/auth/signup', { fullName: 'A1', email: 'nope', password: 'weak', confirmPassword: 'x' });
  assert.equal(r.status, 422);
  for (const f of ['fullName', 'email', 'password', 'confirmPassword']) assert.ok(r.json.errors[f], `missing error for ${f}`);
});

test('signup creates an unverified user, hashes the password, emails a hashed-at-rest OTP', async () => {
  const r = await call('POST', '/auth/signup', { fullName: 'Asha Verma', email: EMAIL, password: PASSWORD, confirmPassword: PASSWORD });
  assert.equal(r.status, 201);
  assert.equal(JSON.stringify(r.json).includes(lastOtp()), false, 'OTP must never be in the API response');

  const user = await User.findOne({ email: EMAIL }).select('+password +otpHash +otpExpiry');
  assert.equal(user.isVerified, false);
  assert.ok(user.password.startsWith('$2'), 'password stored as bcrypt hash');
  assert.notEqual(user.password, PASSWORD);
  assert.ok(user.otpHash.startsWith('$2') && user.otpHash !== lastOtp(), 'OTP stored hashed');
  assert.match(lastOtp(), /^\d{6}$/);
  const minutes = (user.otpExpiry - Date.now()) / 60000;
  assert.ok(minutes > 9 && minutes <= 10, `expiry should be ~10 min, was ${minutes}`);
});

test('unverified users cannot log in', async () => {
  const r = await call('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  assert.equal(r.status, 403);
  assert.equal(r.json.code, 'UNVERIFIED');
  assert.equal(r.setCookie, null);
});

test('resend is blocked during cooldown, then issues a new OTP and invalidates the old one', async () => {
  const early = await call('POST', '/auth/resend-otp', { email: EMAIL });
  assert.equal(early.status, 429);
  assert.ok(early.json.resendAvailableInSeconds > 0);

  const oldOtp = lastOtp();
  await User.updateOne({ email: EMAIL }, { otpResendAvailableAt: new Date(Date.now() - 1000) });
  const r = await call('POST', '/auth/resend-otp', { email: EMAIL });
  assert.equal(r.status, 200);
  assert.equal(outbox.otp.length, 2);
  if (lastOtp() !== oldOtp) {
    const stale = await call('POST', '/auth/verify-otp', { email: EMAIL, otp: oldOtp });
    assert.equal(stale.status, 400, 'previous OTP must be invalid');
  }
});

test('wrong OTP is rejected and attempts are limited', async () => {
  const wrong = lastOtp() === '000000' ? '111111' : '000000';
  const r = await call('POST', '/auth/verify-otp', { email: EMAIL, otp: wrong });
  assert.equal(r.status, 400);
  assert.match(r.json.message, /Incorrect code/);
});

test('expired OTP is rejected', async () => {
  await User.updateOne({ email: EMAIL }, { otpExpiry: new Date(Date.now() - 1000) });
  const r = await call('POST', '/auth/verify-otp', { email: EMAIL, otp: lastOtp() });
  assert.equal(r.status, 400);
  assert.equal(r.json.code, 'OTP_EXPIRED');
  // restore a valid expiry for the next test
  await User.updateOne({ email: EMAIL }, { otpExpiry: new Date(Date.now() + 5 * 60000), otpResendAvailableAt: new Date(Date.now() - 1000) });
});

test('correct OTP verifies the account and cannot be reused', async () => {
  const otp = lastOtp();
  const ok = await call('POST', '/auth/verify-otp', { email: EMAIL, otp });
  assert.equal(ok.status, 200);
  const user = await User.findOne({ email: EMAIL }).select('+otpHash');
  assert.equal(user.isVerified, true);
  assert.equal(user.otpHash, undefined, 'OTP invalidated after use');
  const reuse = await call('POST', '/auth/verify-otp', { email: EMAIL, otp });
  assert.equal(reuse.status, 400);
});

test('duplicate signup with a verified email is blocked', async () => {
  const r = await call('POST', '/auth/signup', { fullName: 'Asha Verma', email: EMAIL, password: PASSWORD, confirmPassword: PASSWORD });
  assert.equal(r.status, 409);
});

test('protected routes reject anonymous requests', async () => {
  for (const [m, p] of [['GET', '/user/me'], ['GET', '/hackathon/my-entry'], ['POST', '/hackathon/register']]) {
    const r = await call(m, p, m === 'POST' ? {} : undefined, { withCookie: false });
    assert.equal(r.status, 401, `${m} ${p}`);
  }
});

test('login rejects wrong password and NoSQL-injection payloads', async () => {
  const bad = await call('POST', '/auth/login', { email: EMAIL, password: 'Wrong1Pass' });
  assert.equal(bad.status, 401);
  const inj = await call('POST', '/auth/login', { email: { $gt: '' }, password: { $gt: '' } });
  assert.ok([400, 422].includes(inj.status), `injection got ${inj.status}`);
});

test('login succeeds, sets an HTTP-only cookie and exposes no secrets', async () => {
  const r = await call('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  assert.equal(r.status, 200);
  assert.match(r.setCookie, /token=/); assert.match(r.setCookie, /HttpOnly/i);
  cookie = r.setCookie.split(';')[0];
  const body = JSON.stringify(r.json);
  for (const secret of ['password', 'otpHash', '$2']) assert.equal(body.includes(secret), false, `leaked ${secret}`);
});

test('GET /user/me returns the real user and registration state', async () => {
  const r = await call('GET', '/user/me');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.user.email, EMAIL);
  assert.equal(r.json.data.isRegistered, false);
});

test('PUT /user/update changes the name', async () => {
  const r = await call('PUT', '/user/update', { fullName: 'Asha Verma Singh' });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.user.fullName, 'Asha Verma Singh');
});

test('registration validation covers fields, links and team rules', async () => {
  const r = await call('POST', '/hackathon/register', registration({
    fullName: 'Al', mobileNumber: '12345', projectName: 'abc', pptLink: 'https://example.com/x',
    prototypeLink: 'not a url', demoVideoLink: 'http://insecure.com', teamSize: 3, teamMembers: [],
  }));
  assert.equal(r.status, 422);
  for (const f of ['fullName', 'mobileNumber', 'projectName', 'pptLink', 'prototypeLink', 'demoVideoLink', 'teamMembers']) {
    assert.ok(r.json.errors[f], `missing error for ${f}`);
  }
  const solo = await call('POST', '/hackathon/register', registration({ teamSize: 1, teamMembers: [{ name: 'Extra Person', email: 'e@x.com' }] }));
  assert.equal(solo.status, 422);
  const dup = await call('POST', '/hackathon/register', registration({
    teamSize: 2, teamMembers: [{ name: 'Ravi Kumar', email: EMAIL }, { name: 'Neha Sharma', email: 'neha@example.com' }],
  }));
  assert.equal(dup.status, 422, 'member email equal to leader email must be rejected');
});

test('valid team registration (size 3) is saved and a confirmation email is sent', async () => {
  const members = [
    { name: 'Ravi Kumar', email: 'ravi@example.com' },
    { name: 'Neha Sharma', email: 'neha@example.com' },
    { name: 'Karan Mehta', email: 'karan@example.com' },
  ];
  const r = await call('POST', '/hackathon/register', registration({ teamSize: 3, teamMembers: members }));
  assert.equal(r.status, 201);
  assert.equal(r.json.data.emailSent, true);
  assert.equal(outbox.confirmation.length, 1);
  assert.equal(outbox.confirmation[0].to, EMAIL);
  const saved = await HackathonRegistration.findOne({ email: EMAIL });
  assert.equal(saved.teamMembers.length, 3);
  assert.equal(String(saved.userId), String((await User.findOne({ email: EMAIL }))._id));
});

test('duplicate registration is prevented', async () => {
  const r = await call('POST', '/hackathon/register', registration());
  assert.equal(r.status, 409);
  assert.equal(await HackathonRegistration.countDocuments(), 1);
});

test('my-entry and dashboard state reflect the saved registration', async () => {
  const entry = await call('GET', '/hackathon/my-entry');
  assert.equal(entry.json.data.registration.projectName, 'Prenatal Risk Tracker');
  const me = await call('GET', '/user/me');
  assert.equal(me.json.data.isRegistered, true);
});

test('contact form validates, stores and forwards the message', async () => {
  const bad = await call('POST', '/contact', { name: '', email: 'x', message: 'short' }, { withCookie: false });
  assert.equal(bad.status, 422);
  const ok = await call('POST', '/contact', { name: 'Priya', email: 'priya@example.com', message: 'When do results come out?' }, { withCookie: false });
  assert.equal(ok.status, 201);
  assert.equal(outbox.contact.length, 1);
});

test('delete removes only the owner entry; logout clears the cookie', async () => {
  const entry = await call('GET', '/hackathon/my-entry');
  const id = entry.json.data.registration._id;
  const bad = await call('DELETE', '/hackathon/not-an-id');
  assert.equal(bad.status, 400);
  const del = await call('DELETE', `/hackathon/${id}`);
  assert.equal(del.status, 200);
  assert.equal(await HackathonRegistration.countDocuments(), 0);

  const out = await call('POST', '/auth/logout');
  assert.equal(out.status, 200);
  assert.match(out.setCookie, /token=;/);
});
