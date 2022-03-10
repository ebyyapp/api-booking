const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/groups.controllers");
const auth = require("../../middleware/auth.middleware");
const shop = require("../../middleware/shop.middleware");
const _database = require("../../middleware/db.switch");

//----- Partner
router.post(
  "/private/group/new/:shopId",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.newGroup
);
router.get(
  "/private/groups/:shopId",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.getAllGroups
);
router.put(
  "/private/group/:groupId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.update
);
router.delete(
  "/private/groups",
  _database.switch,
  auth.checkAuth(),
  Ctrl.delete
);

module.exports = router;
