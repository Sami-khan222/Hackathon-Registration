/** Client-side validators. They mirror server/utils/validators.js; the server stays the source of truth. */
const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
const PPT_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'office.com'];

export const nameError = (value, label = 'Full name') => {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < 3) return `${label} must be at least 3 characters.`;
  if (!NAME_REGEX.test(v)) return `${label} can contain letters only.`;
  return '';
};

export const emailError = (value, label = 'Email') => {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  return EMAIL_REGEX.test(v) ? '' : `Enter a valid ${label.toLowerCase()}.`;
};

export const passwordError = (value) =>
  PASSWORD_REGEX.test(value) ? '' : 'Use 8+ characters with an uppercase letter, a lowercase letter and a number.';

export const mobileError = (value) => (MOBILE_REGEX.test(value.trim()) ? '' : 'Enter a valid 10-digit mobile number.');

const parseHttps = (value) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
};

export const urlError = (value, label, { required = true, driveOnly = false } = {}) => {
  if (!value.trim()) return required ? `${label} is required.` : '';
  const url = parseHttps(value);
  if (!url) return `${label} must be a valid https link.`;
  if (driveOnly && !PPT_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
    return `${label} must be a Google Drive or OneDrive shareable link.`;
  }
  return '';
};

/** Team size N > 1 shows N member entries; team size 1 (solo) shows none. */
export const memberCountFor = (teamSize) => (Number(teamSize) > 1 ? Number(teamSize) : 0);
