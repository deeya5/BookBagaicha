const express = require("express");
const ActivityLog = require("../models/activityLog");

module.exports = (authenticateToken) => {
  const router = express.Router();

  // Protected route
  router.get("/activity-log", authenticateToken, async (req, res) => {
    try {
      const logs = await ActivityLog.find()
  .sort({ timestamp: -1 })
  .limit(10)
  .populate("user", "username"); // Only get username from User model
      res.json(logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  return router;
};
