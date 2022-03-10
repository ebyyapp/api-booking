const express = require("express");
const router = express.Router();

const Ctrl = require("../../controllers/availablity.controllers");
const auth = require("../../middleware/auth.middleware");
const _database = require("../../middleware/db.switch");

//----- Partner
router.post("/private/availablity/new",_database.switch, auth.checkAuth(), Ctrl.newAvailablity);

//----- Public
router.get("/availablity/dates/:roomId",_database.switch, Ctrl.getDates);

module.exports = router;
