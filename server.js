const express = require("express");
const http = require("http");
const app = express();
const databases = require("./v1/models");

require("dotenv").config();

// *@ Moment Js
moment = require("moment");
moment.locale("fr");

// *@ CORS
const cors = require("cors");
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/public", express.static("public"));
app.use("/public/documents", express.static("public"));


const _alerts = require("./v1/functions/alerts.functions");
const initAlerts = async (database) => {
  try {
    const alerts = await database.alert.findAll({
      where: { status: "waiting" },
    });
    const promises = alerts.map((alert_) => {
      _alerts.addAlert(alert_);
      return true;
    });
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
};
Object.keys(databases).forEach((key) => {
  const db = databases[key];
  /* db.sequelize.sync({ alter: true }).then(() => {
    console.log("alter and re-sync db.");
  }); */
  initAlerts(db);
});
//!------------- Alerts

const _fRoutes = require("./functions/router.function");

//!------------- Routes
const Routes = _fRoutes.fromDir(`${__dirname}/v1/routes/auto`, ".js");

Routes.forEach((route) => {
  const call = require(route);
  app.use("/api/booking/v1", call);
});

app.get("/", async (req, res) => {
  try {
    res.send("Welcome to API Booking");
  } catch (error) {
    res.status(500).json(error);
  }
});

const server = http.createServer(app);

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log("************* Server listen on Port " + PORT);
});

module.exports = app;
