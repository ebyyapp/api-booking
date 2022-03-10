const express = require("express");
const router = express.Router();

const Ctrl = require("../../../controllers/room/images.controllers");
const auth = require("../../../middleware/auth.middleware");
const _database = require("../../../middleware/db.switch");

//----- Partner
router.post(
  "/private/room/images/new/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.addImages
);
router.delete(
  "/private/room/images",
  _database.switch,
  auth.checkAuth(),
  Ctrl.deleteImages
);

module.exports = router;
