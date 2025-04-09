const mongoose = require('mongoose');

// Define the schema for the activity log
const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Refers to the user who performed the action
    details: { type: String }, // Optional: Any additional details about the action
  },
  { timestamps: true }
);

// Create the ActivityLog model
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
