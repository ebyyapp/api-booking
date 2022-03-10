const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/attributes.controllers");
const auth = require("../../middleware/auth.middleware");
const _database = require("../../middleware/db.switch");

//----- Partner
router.post(
  "/private/attributes/new/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.newAttributes
);
router.delete(
  "/private/attributes",
  _database.switch,
  auth.checkAuth(),
  Ctrl.deleteAttributes
);

module.exports = router;
