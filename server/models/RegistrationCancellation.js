const mongoose = require('mongoose');

/** Cancel hone par bana record. createdAt = cancel hone ka time. */
const cancellationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    projectName: { type: String, required: true },
    domain: { type: String, required: true },
    registeredAt: { type: Date },
    snapshot: { type: mongoose.Schema.Types.Mixed }, // cancel ke time registration ki poori copy
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('RegistrationCancellation', cancellationSchema);