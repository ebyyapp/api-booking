const axios = require("axios");
const configs = require("../configs/general.config");

const fetchShops = async ({ shopIds }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        method: "POST",
        url: `${configs.apis.main.url}/${configs.apis.main.fixe}/private/admin/shops`,
        data: { shopIds },
      });
      resolve(result.data);
    } catch (err) {
      reject({
        status: err?.response.status || err?.status || 500,
        data: err?.response?.data || {},
      });
    }
  });
};

module.exports = {
  fetchShops,
};
