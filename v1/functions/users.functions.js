const axios = require("axios");
const configs = require("../configs/general.config");

const fetchUsers = async ({ userIds }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        method: "POST",
        url: `${configs.apis.connect.url}/${configs.apis.connect.fixe}/private/admin/users`,
        data: { userIds },
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
  fetchUsers,
};
