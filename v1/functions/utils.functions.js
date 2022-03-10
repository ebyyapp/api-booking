const verifyShopBelongsToUser = (shopId, user) => {
  return new Promise((resolve, reject) => {
    const shops = user?.shops || [];
    const findShop = shops.find((el) => el.shopId === shopId);
    if (shopId && findShop) {
      return resolve(true);
    } else {
      reject({
        err: {
          item: "shopId",
          value: "La boutique ne vous ai pas attribuée",
        },
        error: "Bad request",
      });
    }
  });
};
const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
};

module.exports = {
  verifyShopBelongsToUser,
  getUniqueListBy,
};
