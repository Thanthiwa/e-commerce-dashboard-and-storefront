const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://Mai:Mx2KXhDhq04Cj2D8@ecom.gkzzwqp.mongodb.net/";

async function testConnection() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
}

testConnection();
