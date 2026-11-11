const mongoose = require('mongoose');
const C = require('../config/constants');

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    // unique index = database-level guarantee of one registration per user (race-condition safe)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Invalid mobile number'] },
    collegeName: { type: String, required: true, enum: C.COLLEGES },
    course: { type: String, required: true, enum: C.COURSES },
    branch: { type: String, required: true, enum: C.BRANCHES },
    yearOfStudy: { type: String, required: true, enum: C.YEARS_OF_STUDY },
    domain: { type: String, required: true, enum: C.DOMAINS },
    projectName: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
    pptLink: { type: String, required: true, trim: true },
    prototypeLink: { type: String, required: true, trim: true },
    demoVideoLink: { type: String, trim: true, default: '' },
    teamSize: { type: Number, required: true, min: 1, max: 5 },
    teamMembers: { type: [teamMemberSchema], default: [] },
  },
  { timestamps: true }
);

registrationSchema.index({ email: 1 });
registrationSchema.index({ domain: 1 });

module.exports = mongoose.model('HackathonRegistration', registrationSchema);
