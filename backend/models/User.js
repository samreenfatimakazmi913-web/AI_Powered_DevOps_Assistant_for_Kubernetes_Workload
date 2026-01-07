const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  resetPasswordToken: {
  type: String,
},

resetPasswordExpires: {
  type: Date,
},

  role: {
    type: String,
    enum: ["admin", "developer"],
    default: "developer",
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },

   profileImage: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  
});

module.exports = mongoose.model("User", UserSchema);
