const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri =
    process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/devops_assistant";
  const urisToTry = [primaryUri, localUri].filter(Boolean);

  if (urisToTry.length === 0) {
    console.warn("⚠️ No Mongo URI configured. Running without MongoDB.");
    return;
  }

  for (let i = 0; i < urisToTry.length; i += 1) {
    const uri = urisToTry[i];

    try {
      await mongoose.connect(uri);
      console.log(
        `✅ MongoDB Connected (${i === 0 ? "MONGO_URI" : "LOCAL_MONGO_URI"}) — database: ${mongoose.connection.name}`
      );
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection failed (${i + 1}/${urisToTry.length}):`, err.message);
    }
  }

  console.warn("⚠️ Continuing without MongoDB (local/dev fallback mode).");
};

module.exports = connectDB;
