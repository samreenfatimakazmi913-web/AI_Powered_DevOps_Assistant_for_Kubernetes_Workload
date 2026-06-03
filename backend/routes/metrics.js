const express = require("express");
const router = express.Router();
const MetricsHistory = require("../models/metricsHistory");

// 📊 Get historical metrics
router.get("/metrics-history", async (req, res) => {
  try {
    const { range = "1h", deployments } = req.query;

    let timeFilter = new Date();

    if (range === "1h") timeFilter.setHours(timeFilter.getHours() - 1);
    if (range === "6h") timeFilter.setHours(timeFilter.getHours() - 6);
    if (range === "24h") timeFilter.setDate(timeFilter.getDate() - 1);
    if (range === "7d") timeFilter.setDate(timeFilter.getDate() - 7);

    const filter = {
      timestamp: { $gte: timeFilter },
    };

    if (deployments) {
      filter.deployment = { $in: deployments.split(",") };
    }

    const data = await MetricsHistory.find(filter).sort({ timestamp: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;