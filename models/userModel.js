const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a valid name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  cover: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a valid password"],
    minlength: [8, "Please enter a password with min 8 characters"],
    select: false,
  },

  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
});

// Hashing password and remove passwordConfirm from database
userSchema.pre("save", async function (next) {
  //Only run the function if the password is modified or created
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field from the database
  // this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//checking if the password entered is the same for that email
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Virtual populate
userSchema.virtual("disasters", {
  ref: "Disaster",
  foreignField: "rescueUnit",
  localField: "_id",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
