/**
 * Single source of truth for business rules and the dropdown options used by
 * the registration form. The client loads the options from
 * GET /api/hackathon/options so lists never drift between frontend and backend.
 */
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

// Event details used in emails. Keep in sync with client/src/utils/eventConfig.js
const EVENT = {
  name: 'MatruCare AI Hackathon 2027',
  dates: '20–21 February 2027',
  mode: 'Hybrid (online rounds + on-site finale)',
};

const COLLEGES = [
  'Indian Institute of Technology (IIT)',
  'National Institute of Technology (NIT)',
  'Indian Institute of Information Technology (IIIT)',
  'Delhi Technological University',
  'Vellore Institute of Technology',
  'BITS Pilani',
  'Manipal Institute of Technology',
  'SRM Institute of Science and Technology',
  'Amity University',
  'Lovely Professional University',
  'Anna University',
  'Jadavpur University',
  'Savitribai Phule Pune University',
  'Aligarh Muslim University',
  'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
  'Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)',
  'Visvesvaraya Technological University (VTU)',
  'Other',
];

const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'BBA', 'MBA', 'Diploma', 'Other'];
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AI & ML', 'Data Science', 'Biotechnology', 'Other'];
const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DOMAINS = ['AI/ML', 'Web Development', 'IoT', 'Cyber Security', 'Blockchain', 'Healthcare Tech', 'Mobile App Development', 'Data Science'];
const TEAM_SIZES = [1, 2, 3, 4, 5];

// Hosts accepted for the PPT link (Google Drive / OneDrive shareable links)
const PPT_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'office.com'];

module.exports = {
  OTP_LENGTH, OTP_EXPIRY_MINUTES, OTP_RESEND_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS,
  EVENT, COLLEGES, COURSES, BRANCHES, YEARS_OF_STUDY, DOMAINS, TEAM_SIZES, PPT_HOSTS,
};
