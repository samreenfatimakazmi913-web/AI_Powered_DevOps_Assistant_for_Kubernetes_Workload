const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  // Legacy single-namespace field kept for backward compat; primary field is namespaces[]
  namespace: {
    type: String,
    default: "",
  },

  // Teams can have access to multiple namespaces
  namespaces: {
    type: [String],
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Team", TeamSchema);
