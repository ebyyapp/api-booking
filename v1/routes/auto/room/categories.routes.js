const express = require("express");
const router = express.Router();

const Ctrl = require("../../../controllers/room/categories.controllers");
const auth = require("../../../middleware/auth.middleware");
const _database = require("../../../middleware/db.switch");

//----- Partner
router.post(
  "/private/room/categories/set/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.setRoomCategories
);
/* router.delete(
  "/private/room/categories/delete/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.deleteCategories
); */

module.exports = router;
