const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 3, maxlength: 60 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    // select:false keeps secrets out of every query unless explicitly requested
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpResendAvailableAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

// Never leak sensitive fields, even if a document is serialised by accident
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password; delete ret.otpHash; delete ret.otpExpiry;
    delete ret.otpResendAvailableAt; delete ret.otpAttempts; delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
