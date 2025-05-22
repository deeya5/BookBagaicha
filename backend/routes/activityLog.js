const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/activityLog");  // Assuming you have this model

// route for getting activity logs
router.get("/activity-log", async (req, res) => {
    try {
        const logs = await ActivityLog.find();  // Fetching all logs from the ActivityLog model
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching activity logs" });
    }
});

module.exports = router;  // Ensure this export is correct
