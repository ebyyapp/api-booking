const express = require("express");
const router = express.Router();

const Ctrl = require("../../../controllers/room/features.controllers");
const auth = require("../../../middleware/auth.middleware");
const _database = require("../../../middleware/db.switch");

//----- Partner
router.post(
  "/private/room/features/new/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.addFeatures
);
router.delete(
  "/private/room/features",
  _database.switch,
  auth.checkAuth(),
  Ctrl.deleteFeatures
);

module.exports = router;
