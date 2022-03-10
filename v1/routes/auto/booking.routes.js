const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/booking.controllers");
const auth = require("../../middleware/auth.middleware");
const shop = require("../../middleware/shop.middleware");
const _database = require("../../middleware/db.switch");

//-----User
router.post("/private/user/booking/new",_database.switch, auth.checkAuth(), Ctrl.newBooking);
router.get("/private/user/bookings",_database.switch, auth.checkAuth(), Ctrl.getUserBookings);
router.get(
  "/private/shop/bookings/:shopId",
  _database.switch,
  auth.checkAuth(),
  shop.getShop(),
  shop.shopBelongsToUser(),
  Ctrl.getShopBookings
);
router.get(
  "/private/room/bookings/:roomId",
  _database.switch,
  auth.checkAuth(),
  Ctrl.getRoomBookings
);

module.exports = router;
