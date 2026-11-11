/**
 * Event content shown on the Home page.
 * NOTE: dates, prize amounts and social URLs are placeholders. Update them before launch.
 * Event name/dates must match server/config/constants.js (used in confirmation emails).
 */
export const CONTACT_EMAIL = 'matrucareai@gmail.com';

export const EVENT = {
  name: 'MatruCare AI Hackathon 2027',
  dates: '20–21 February 2027',
  mode: 'Hybrid',
  location: 'Online rounds + on-site finale',
};

export const TIMELINE = [
  { date: '1 Dec 2026', title: 'Registrations open', text: 'Create an account, verify your email and register your team.' },
  { date: '15 Jan 2027', title: 'Registrations close', text: 'Submit your idea deck and prototype link before midnight IST.' },
  { date: '25 Jan 2027', title: 'Shortlist announced', text: 'Top 50 teams are notified by email and invited to the mentoring round.' },
  { date: '8 Feb 2027', title: 'Mentoring round', text: 'Work with healthcare and AI mentors to sharpen your build.' },
  { date: '20–21 Feb 2027', title: 'Grand finale', text: 'Pitch live to the jury. Winners are announced on day two.' },
];

export const PRIZES = [
  { place: 'Winner', amount: '₹1,00,000', perks: ['Cash prize', 'Internship interviews with MatruCare AI', 'Mentorship for 3 months'] },
  { place: 'First runner-up', amount: '₹60,000', perks: ['Cash prize', 'Fast-track internship screening'] },
  { place: 'Second runner-up', amount: '₹40,000', perks: ['Cash prize', 'Certificates and swag'] },
];

export const HIGHLIGHTS = [
  { icon: 'Brain', title: 'Eight open tracks', text: 'AI/ML, IoT, cyber security, blockchain, web, mobile, data science and healthcare tech.' },
  { icon: 'Users', title: 'Teams of up to five', text: 'Build solo or bring a team. Add each teammate while registering.' },
  { icon: 'Stethoscope', title: 'Clinician mentors', text: 'Get feedback from doctors and ML engineers who work on maternal care.' },
  { icon: 'ShieldCheck', title: 'Real problem statements', text: 'Every track starts from a gap observed in antenatal and postnatal care.' },
];

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'X', href: 'https://x.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'GitHub', href: 'https://github.com/' },
];
