module.exports = {
  v1: {
    development: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "mysql",
      timezone: "+02:00",
    },
    production: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: `${process.env.DB_NAME}_production`,
      host: process.env.DB_HOST,
      dialect: "mysql",
      timezone: "+02:00",
    },
  },
};
