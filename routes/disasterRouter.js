const express = require("express");

const router = express.Router();

const disasterController = require("../controllers/disasterController");
const userController = require("../controllers/userController");

router
  .route("/")
  .get(disasterController.getAllDisasters)
  .post(userController.getAllAdmins, disasterController.createDisaster);

router.route("/rescue/:rescueId").get(disasterController.getRescueDisasters);

router.route("/:id").get(disasterController.getDisaster);
// .patch(disasterController.updateDisaster);

router.route("/accept/:disasterId").patch(disasterController.acceptDisaster);
router
  .route("/refuse/:disasterId/:rescueId")
  .patch(userController.getAllAdmins, disasterController.refuseDisaster);

module.exports = router;
