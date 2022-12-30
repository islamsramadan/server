const multer = require("multer");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Kindly upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// module.exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not available, use sign up route!",
//   });
// };

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// // not for update password
// exports.updateUser = factory.updateOne(User);
// exports.deleteUser = factory.deleteOne(User);

///////////////////
// middleWare for preparing admins for calculating
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const admins = await User.find({ role: "admin" });

  req.admins = admins;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  // if (req.file) filteredBody.photo = req.file.filename;

  // console.log(req.file.filename);
  await User.findByIdAndUpdate(req.user._id, {
    photo: req.file.filename,
  });

  const updatedUser = await User.findById(req.user._id);

  // console.log(updatedUser);

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});
