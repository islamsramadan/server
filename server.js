const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception! 🌟 Shutting Down...");

  process.exit(1);
});

const app = require("./app");
const User = require("./models/userModel");
const { users } = require("./data/users");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => {
  // User.create(users);
  console.log("successful connection");
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log("app is running...");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandeled Rejection! 🌟 Shutting Down...");

  server.close(() => {
    process.exit(1);
  });
});
