const _utils = require("../functions/utils.functions");

exports.getShop = (type) => {
  return async (req, res, next) => {
    const { db } = req;
    try {
      const shopId = req.params?.shopId || req.body?.shopId;
      if (!shopId) {
        return res
          .status(400)
          .json({ err: { item: "shopId" }, error: "Bad request" });
      }
      const this_shop = await db.shop.findOne({ where: { shopId } });
      if (this_shop?.id) {
        req.shop = this_shop;
        next();
      } else {
        req.shop = {};
        return res
          .status(404)
          .json({ err: { item: "shopId" }, error: "Shop not found" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err, error: "Error server" });
    }
  };
};

exports.shopBelongsToUser = (type) => {
  return async (req, res, next) => {
    try {
      const shopId = req.params.shopId || req.body.shopId;
      _utils
        .verifyShopBelongsToUser(shopId, req.user || {})
        .then(() => {
          next();
        })
        .catch((err) => {
          console.log(err);
          res.status(401).json(err);
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err, error: "Error server" });
    }
  };
};
