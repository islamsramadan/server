const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.get(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers
);

router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getUser
);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.updateMe
);

// // To protect all the routes below
// router.use(authController.protect);

// router.patch("/updateMyPassword", authController.updatePassword);
// router.get("/me", userController.getMe, userController.getUser);
// router.patch("/updateMe", userController.updateMe);
// router.delete("/deleteMe", userController.deleteMe);

// // To restrict all the routes below to admin
// router.use(authController.restrictTo("admin"));

// router
//   .route("/")
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   // not for update password
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
