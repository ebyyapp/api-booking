const { ObjectOf } = require("../../../propstypes");
const { newRoom, roomGet } = require("../../configs/rules.configs");
const randomstring = require("randomstring");
const _fUtils = require("../../../functions/utils.function");
const _room = require("../../functions/room.functions");
const _category = require("../../functions/category.function");

exports.newRoom = async (req, res) => {
  const { db, environement } = req;
  const { shopId, name, modelId } = req.body;

  const result = ObjectOf(req.body, newRoom);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }

  db.shop
    .findOne({ where: { shopId: shopId || null } })
    .then(async (this_shop) => {
      let shop_id = this_shop?.id || null;
      if (!this_shop) {
        const addShop = await db.shop.create({ shopId });
        shop_id = addShop.id || null;
      }
      if (shop_id) {
        const id = `rm_${randomstring.generate(16)}`;
        const slug = _fUtils.generateSlug(name);
        const theModelId = modelId || _fUtils.generateModelId(name);
        const body = Object.assign(req.body, {
          id,
          slug,
          shopId: shop_id,
          modelId: theModelId,
        });
        db.room
          .create(body)
          .then((room) => {
            res.send(room);
          })
          .catch((err) => {
            res.status(500).json({ err, error: "Error on room.create " });
          });
      } else {
        res.status(500).json({ err, error: "Error on shop_id " });
      }
    })
    .catch((err) => {
      res.status(500).json({ err, error: "Error on shop.findone " });
    });
};

exports.getAllRooms = (type) => {
  return async (req, res) => {
    const { environement } = req;
    try {
      const result = ObjectOf(req.body, roomGet);
      if (!result.correct) {
        return res.status(result?.status || 500).json(result || {});
      }
      const { filters } = req.body;
      const { category } = req.query;
      const shopId = req.shop.id;
      let categories = null;
      if (category) {
        categories = await _category.getIdsByCat({ shopId, id: category }, environement);
      }

      const where = { private: false };
      const types = {
        public: where,
      };
      _room
        .findAll(
          { shopId, where: types[type], categories, filters },
          environement
        )
        .then(async (data) => {
          res.send(data);
        })
        .catch((err) => {
          console.log(err);
          res.status(err?.status || 500).json(err?.data || err);
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err, error: "Error server" });
    }
  };
};

exports.getFilters = async (req, res) => {
  const { environement } = req;
  const shopId = req.shop.id;
  const { category } = req.query;
  try {
    let categories = null;
    if (category) {
      categories = await _category.getIdsByCat({ shopId, id: category }, environement);
    }
    const filters = await _room.getFilters(
      { shopId, category: categories },
      environement
    );
    res.send(filters);
  } catch (err) {
    res.status(500).json({ err, error: "Error server" });
  }
};

exports.getOneRoom = (type) => {
  return async (req, res) => {
    const { environement } = req;
    const { id } = req.params;
    const where = { private: false };
    const types = {
      public: where,
    };
    _room
      .findOne({ id, where: types[type] }, environement)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(err?.status || 500).json(err?.data || err);
      });
  };
};
