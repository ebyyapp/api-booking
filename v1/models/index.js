const fs = require("fs");
const path = require("path");
require("dotenv").config();
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const configs = require("../../config/db.config")["v1"];

const mysql = require("mysql2/promise");
let sequelize;
const databases = {};
Object.entries(configs).forEach(([env, config]) => {
  const db = {};
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
  async function initialize() {
    // create db if it doesn't already exist
    const { host, port, username, password, database } = config;
    const connection = await mysql.createConnection({
      host,
      port: "3306",
      user: username,
      password,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  }
  initialize();
  let modules = [];
  fromDir = (startPath, filter) => {
    if (!fs.existsSync(startPath)) {
      console.log("no dir ", startPath);
      return;
    }
    let files = fs.readdirSync(startPath);
    files.forEach((file) => {
      let filename = path.join(startPath, file);
      let stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        fromDir(filename, filter); //recurse
      } else if (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        file.slice(-3) === filter
      ) {
        const model = require(path.join(filename));
        modules.push(model);
      }
    });
  };

  fromDir(__dirname, ".js");

  modules.forEach((module) => {
    const model = module(sequelize, Sequelize, config);
    db[model.name] = model;
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  Object.assign(databases, { [env]: db });
});

module.exports = databases;
