const mongoose = require("mongoose");

const MetricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: "7d" }, // 🔥 auto delete after 7 days
  },

  deployment: { type: String, index: true },
  namespace: { type: String, index: true },

  cpu: Number,
  memory: Number,
});

module.exports = mongoose.model("MetricsHistory", MetricsSchema);