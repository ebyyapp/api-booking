const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/time.controllers");
const auth = require("../../middleware/auth.middleware");
const _database = require("../../middleware/db.switch");

//-----Partner
router.post(
  "/private/time/new",
  _database.switch,
  auth.checkAuth(),
  Ctrl.newTimes
);

module.exports = router;
