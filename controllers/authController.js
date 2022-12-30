const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const tokenOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") tokenOptions.secure = true;

  res.cookie("jwt", token, tokenOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

module.exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(
      new AppError(
        "Kindly provide your name, email and password more than 8 digits",
        400
      )
    );
  }

  // Change the way of creation to avoid inserting role admin
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
});

module.exports.logIn = catchAsync(async (req, res, next) => {
  // 1) check if the email and password are provided
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Kindly provide your email and password", 400));
  }

  // 2) check if the user exists and the password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything is ok send token to the client
  createSendToken(user, 200, res);
});

module.exports.protect = catchAsync(async (req, res, next) => {
  // 1) Checking if there is a token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "You are not authenticated! Kindly log in and try again!",
        401
      )
    );
  }

  // 2) Verfication of token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Checking if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token is no longer exist!", 401)
    );
  }

  // // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! Please log in again.", 401)
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

module.exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have the permission to perform this action",
          403
        )
      );
    }

    next();
  };
