/**
 * Request validation. Each validateX function returns cleaned values or throws a 422 ApiError
 * containing one message per invalid field (the frontend shows them under each input).
 */
const validator = require('validator');
const ApiError = require('./ApiError');
const C = require('../config/constants');

const clean = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value);
const isString = (v) => typeof v === 'string';
const lower = (v) => (isString(v) ? v.trim().toLowerCase() : '');
const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;      // letters and single spaces only
const MOBILE_REGEX = /^[6-9]\d{9}$/;                  // Indian mobile: 10 digits starting 6-9
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

const throwIfInvalid = (errors) => {
  if (Object.keys(errors).length) throw new ApiError(422, 'Please fix the highlighted fields.', errors);
};

const checkName = (value, label = 'Full name') => {
  if (!isString(value) || !value) return `${label} is required.`;
  if (value.length < 3) return `${label} must be at least 3 characters.`;
  if (value.length > 60) return `${label} must be at most 60 characters.`;
  if (!NAME_REGEX.test(value)) return `${label} can contain letters only.`;
  return null;
};

const checkEmail = (value, label = 'Email') => {
  if (!isString(value) || !value) return `${label} is required.`;
  if (!validator.isEmail(value) || value.length > 254) return `Enter a valid ${label.toLowerCase()}.`;
  return null;
};

const checkUrl = (value, label, { hosts } = {}) => {
  if (!validator.isURL(value, { protocols: ['https'], require_protocol: true, require_tld: true })) {
    return `${label} must be a valid https link.`;
  }
  if (hosts) {
    const host = new URL(value).hostname.toLowerCase();
    if (!hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return `${label} must be a Google Drive or OneDrive shareable link.`;
    }
  }
  return null;
};

const validateSignup = (body = {}) => {
  const errors = {};
  const fullName = clean(body.fullName);
  const email = lower(body.email);
  const { password, confirmPassword } = body;

  const nameError = checkName(fullName);
  if (nameError) errors.fullName = nameError;
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (!isString(password) || !PASSWORD_REGEX.test(password)) {
    errors.password = 'Password must be 8–64 characters with an uppercase letter, a lowercase letter and a number.';
  }
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  throwIfInvalid(errors);
  return { fullName, email, password };
};

const validateLogin = (body = {}) => {
  const errors = {};
  const email = lower(body.email);
  if (!email || !validator.isEmail(email)) errors.email = 'Enter a valid email.';
  if (!isString(body.password) || !body.password) errors.password = 'Password is required.';
  throwIfInvalid(errors);
  return { email, password: body.password };
};

const validateOtpPayload = (body = {}) => {
  const errors = {};
  const email = lower(body.email);
  const otp = isString(body.otp) ? body.otp.trim() : '';
  if (!email || !validator.isEmail(email)) errors.email = 'Enter a valid email.';
  if (!/^\d{6}$/.test(otp)) errors.otp = 'Enter the 6-digit code.';
  throwIfInvalid(errors);
  return { email, otp };
};

const validateEmailOnly = (body = {}) => {
  const email = lower(body.email);
  if (!email || !validator.isEmail(email)) throwIfInvalid({ email: 'Enter a valid email.' });
  return { email };
};

const validateContact = (body = {}) => {
  const errors = {};
  const name = clean(body.name);
  const email = lower(body.email);
  const message = isString(body.message) ? body.message.trim() : '';

  if (!isString(name) || name.length < 2 || name.length > 80) errors.name = 'Enter your name (2–80 characters).';
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (message.length < 10) errors.message = 'Message must be at least 10 characters.';
  else if (message.length > 2000) errors.message = 'Message must be at most 2000 characters.';

  throwIfInvalid(errors);
  return { name, email, message };
};

const validateProfileUpdate = (body = {}) => {
  const fullName = clean(body.fullName);
  const error = checkName(fullName);
  if (error) throwIfInvalid({ fullName: error });
  return { fullName };
};

const validateRegistration = (body = {}) => {
  const errors = {};
  const data = {
    fullName: clean(body.fullName),
    email: lower(body.email),
    mobileNumber: isString(body.mobileNumber) ? body.mobileNumber.trim() : String(body.mobileNumber ?? ''),
    collegeName: clean(body.collegeName),
    course: clean(body.course),
    branch: clean(body.branch),
    yearOfStudy: clean(body.yearOfStudy),
    domain: clean(body.domain),
    projectName: clean(body.projectName),
    pptLink: isString(body.pptLink) ? body.pptLink.trim() : '',
    prototypeLink: isString(body.prototypeLink) ? body.prototypeLink.trim() : '',
    demoVideoLink: isString(body.demoVideoLink) ? body.demoVideoLink.trim() : '',
    teamSize: Number(body.teamSize),
    teamMembers: [],
  };

  const nameError = checkName(data.fullName);
  if (nameError) errors.fullName = nameError;
  const emailError = checkEmail(data.email, 'Email address');
  if (emailError) errors.email = emailError;
  if (!MOBILE_REGEX.test(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';

  const oneOf = (field, list, label) => {
    if (!list.includes(data[field])) errors[field] = `Select a valid ${label}.`;
  };
  oneOf('collegeName', C.COLLEGES, 'college');
  oneOf('course', C.COURSES, 'course');
  oneOf('branch', C.BRANCHES, 'branch');
  oneOf('yearOfStudy', C.YEARS_OF_STUDY, 'year of study');
  oneOf('domain', C.DOMAINS, 'domain');

  if (!isString(data.projectName) || data.projectName.length < 5) errors.projectName = 'Project name must be at least 5 characters.';
  else if (data.projectName.length > 100) errors.projectName = 'Project name must be at most 100 characters.';

  if (!data.pptLink) errors.pptLink = 'PPT link is required.';
  else { const e = checkUrl(data.pptLink, 'PPT link', { hosts: C.PPT_HOSTS }); if (e) errors.pptLink = e; }

  if (!data.prototypeLink) errors.prototypeLink = 'Prototype link is required.';
  else { const e = checkUrl(data.prototypeLink, 'Prototype link'); if (e) errors.prototypeLink = e; }

  if (data.demoVideoLink) { const e = checkUrl(data.demoVideoLink, 'Demo video link'); if (e) errors.demoVideoLink = e; }

  if (!C.TEAM_SIZES.includes(data.teamSize)) {
    errors.teamSize = 'Team size must be between 1 and 5.';
  } else {
    /**
     * Brief: team size N (N > 1) shows N member entries; team size 1 (solo) shows none.
     * The leader is the logged-in participant, so these entries are the teammates.
     */
    const expected = data.teamSize === 1 ? 0 : data.teamSize;
    const members = Array.isArray(body.teamMembers) ? body.teamMembers : [];
    if (members.length !== expected) {
      errors.teamMembers = expected === 0 ? 'Solo teams cannot have team members.' : `Provide details for exactly ${expected} team members.`;
    } else {
      const memberErrors = [];
      const seen = new Set([data.email]);
      members.forEach((m, index) => {
        const entry = {};
        const name = clean(m?.name);
        const email = lower(m?.email);
        const ne = checkName(name, 'Member name'); if (ne) entry.name = ne;
        const ee = checkEmail(email, 'Member email');
        if (ee) entry.email = ee;
        else if (seen.has(email)) entry.email = 'Each team member needs a unique email.';
        seen.add(email);
        memberErrors[index] = entry;
        data.teamMembers.push({ name, email });
      });
      if (memberErrors.some((e) => Object.keys(e).length)) errors.teamMembers = memberErrors;
    }
  }

  throwIfInvalid(errors);
  return data;
};

module.exports = {
  validateSignup, validateLogin, validateOtpPayload, validateEmailOnly,
  validateContact, validateProfileUpdate, validateRegistration,
};
