const express = require("express");
const router = express.Router();

const Ctrl = require("../../../controllers/room/room.controllers");
const auth = require("../../../middleware/auth.middleware");
const shop = require("../../../middleware/shop.middleware");
const _database = require("../../../middleware/db.switch");

//------ Partner
router.post(
  "/private/room/new",
  _database.switch,
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.newRoom
);
router.post(
  "/private/rooms/:shopId",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.getAllRooms()
);
router.get(
  "/private/room/:shopId/:id",
  _database.switch,
  shop.getShop(),
  auth.checkAuth(),
  shop.shopBelongsToUser(),
  Ctrl.getOneRoom()
);

//------ Public
router.post(
  "/public/rooms/:shopId",
  _database.switch,
  shop.getShop(),
  Ctrl.getAllRooms("public")
);
router.get("/public/room/:id", _database.switch, Ctrl.getOneRoom("public"));
router.get(
  "/public/filters/:shopId",
  _database.switch,
  shop.getShop(),
  Ctrl.getFilters
);

module.exports = router;
