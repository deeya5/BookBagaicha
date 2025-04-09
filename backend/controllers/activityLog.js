const ActivityLog = require("../models/activityLog"); 


const logActivity = async (action, userId, details = "") => {
  try {
    await ActivityLog.create({
      action,
      user: userId,
      details,
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

module.exports = logActivity;
