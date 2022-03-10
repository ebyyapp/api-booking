const express = require("express");
const router = express.Router();

const Ctrl = require("../../../controllers/room/options.controllers");
const auth = require("../../../middleware/auth.middleware");
const _database = require("../../../middleware/db.switch");

//----- Partner
router.post(
  "/private/room/options/set/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.setRoomOprions
);

module.exports = router;
