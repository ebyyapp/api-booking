const axios = require("axios");
const configs = require("../configs/general.config");
const apiConnect = configs.apis.connect;

exports.checkAuth = (type) => {
  return async (req, res, next) => {
    const oAuth = req.headers["o-auth"];
    const keyApp = req.headers["key-app"];

    if (oAuth && keyApp) {
      const o = {
        keyApp,
        oAuth,
      };
      await axios({
        method: "POST",
        url: `${apiConnect.url}/${apiConnect.fixe}/auth/check`,
        data: o,
      })
        .then(async (result) => {
          req.user = result.data?.user || {};
          next();
        })
        .catch((err) => {
          res
            .status(err?.response?.status || err?.status || 500)
            .json(err?.response?.data || err);
        });
    } else {
      res.status(400).json({
        err: {
          item: "oAuth and keyApp",
          value: "Définissez un oAuth et un keyApp",
        },
        error: "Bad request",
      });
    }
  };
};
