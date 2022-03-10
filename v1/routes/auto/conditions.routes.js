const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/conditions.controllers");
const auth = require("../../middleware/auth.middleware");
const shop = require("../../middleware/shop.middleware");
const _database = require("../../middleware/db.switch");

//----- Partner
router.post(
  "/private/condition/set/:groupId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.setConditions
);

module.exports = router;
