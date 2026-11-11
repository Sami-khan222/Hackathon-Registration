const HackathonRegistration = require('../models/HackathonRegistration');
const RegistrationCancellation = require('../models/RegistrationCancellation');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { DOMAINS } = require('../config/constants');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** ?page aur ?limit safely padhta hai (limit max 100). */
const getPaging = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

// GET /api/admin/stats
const getStats = asyncHandler(async (_req, res) => {
  const [totalUsers, verifiedUsers, registrations, cancellations, contactMessages, byDomain, teamAgg] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    HackathonRegistration.countDocuments(),
    RegistrationCancellation.countDocuments(),
    ContactMessage.countDocuments(),
    HackathonRegistration.aggregate([{ $group: { _id: '$domain', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    HackathonRegistration.aggregate([
      { $group: { _id: null, participants: { $sum: { $add: [1, { $size: '$teamMembers' }] } }, solo: { $sum: { $cond: [{ $eq: ['$teamSize', 1] }, 1, 0] } } } },
    ]),
  ]);

  sendSuccess(res, 200, 'Stats fetched.', {
    totalUsers,
    verifiedUsers,
    registrations, // active registrations = submissions
    cancellations,
    contactMessages,
    totalParticipants: teamAgg[0]?.participants || 0, // lead + team members
    soloTeams: teamAgg[0]?.solo || 0,
    byDomain: byDomain.map((d) => ({ domain: d._id, count: d.count })),
  });
});

const buildRegistrationFilter = ({ search, domain }) => {
  const filter = {};
  if (domain) {
    if (!DOMAINS.includes(domain)) throw new ApiError(422, 'Unknown domain filter.');
    filter.domain = domain;
  }
  if (search && typeof search === 'string') {
    const rx = new RegExp(escapeRegex(search.trim().slice(0, 60)), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { projectName: rx }, { collegeName: rx }];
  }
  return filter;
};

// GET /api/admin/registrations?search=&domain=&page=&limit=
const listRegistrations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query);
  const filter = buildRegistrationFilter(req.query);
  const [registrations, total] = await Promise.all([
    HackathonRegistration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    HackathonRegistration.countDocuments(filter),
  ]);
  sendSuccess(res, 200, 'Registrations fetched.', { registrations, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/admin/cancellations?page=&limit=
const listCancellations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query);
  const [cancellations, total] = await Promise.all([
    RegistrationCancellation.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RegistrationCancellation.countDocuments(),
  ]);
  sendSuccess(res, 200, 'Cancellations fetched.', { cancellations, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

/** CSV cell quote karta hai aur =,+,-,@ se shuru hone wale text ko safe banata hai (Excel formula injection se bachne ke liye). */
const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

// GET /api/admin/registrations/export -> saari registrations ka CSV
const exportRegistrations = asyncHandler(async (_req, res) => {
  const rows = await HackathonRegistration.find().sort({ createdAt: -1 }).lean();
  const headers = ['Registered on', 'Name', 'Email', 'Mobile', 'College', 'Course', 'Branch', 'Year', 'Domain', 'Project', 'PPT link', 'Prototype link', 'Demo video link', 'Team size', 'Team members'];
  const lines = rows.map((r) => [
    new Date(r.createdAt).toISOString(), r.fullName, r.email, r.mobileNumber, r.collegeName, r.course, r.branch, r.yearOfStudy,
    r.domain, r.projectName, r.pptLink, r.prototypeLink, r.demoVideoLink, r.teamSize,
    r.teamMembers.map((m) => `${m.name} <${m.email}>`).join('; '),
  ].map(csvCell).join(','));

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="hackathon-registrations.csv"');
  res.send(`\uFEFF${[headers.map(csvCell).join(','), ...lines].join('\r\n')}`);
});

module.exports = { getStats, listRegistrations, listCancellations, exportRegistrations };