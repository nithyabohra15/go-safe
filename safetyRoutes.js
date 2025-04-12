const express = require('express');
const router = express.Router();

const safetyData = {}; // In-memory storage (Replace with DB in production)

// Save safety settings
router.post('/', (req, res) => {
    const { enableLocation, emergencyContact, alertMessage, alertType } = req.body;

    if (!emergencyContact || !alertMessage) {
        return res.status(400).json({ message: "Emergency contact and message are required" });
    }

    safetyData[req.body.userId] = { enableLocation, emergencyContact, alertMessage, alertType };
    res.status(200).json({ message: "Safety settings saved successfully" });
});

module.exports = router;
