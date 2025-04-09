// backend/models/activityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    action: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    details: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
