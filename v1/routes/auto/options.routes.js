const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/options.controllers");
const auth = require("../../middleware/auth.middleware");
const shop = require("../../middleware/shop.middleware");
const _database = require("../../middleware/db.switch");

//----- Partner
router.post(
  "/private/option/new/:shopId",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.newOption
);
router.get(
  "/private/options/:shopId",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.getAllOptions
);
router.put(
  "/private/option/:optionId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.update
);
router.delete(
  "/private/options",
  _database.switch,
  auth.checkAuth(),
  Ctrl.delete
);

module.exports = router;
