const databases = require("../models");

exports.switch = async (req, res, next) => {
  const environement = "development";
  const db = databases[environement];
  req.db = db;
  req.environement = environement;
  next();
};
