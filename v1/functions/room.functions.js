const _category = require("./category.function");
const { Op } = require("sequelize");
const _utils = require("../functions/utils.functions");
const databases = require("../models");

const findAll = (props, environement) => {
  const db = databases[environement || "development"];
  const { where, shopId, categories, filters } = props;
  const thisWhere = {
    shopId,
    status: ["waiting", "activated"],
  };
  const whereCategory = {};
  if (where) Object.assign(thisWhere, where);
  if (categories) Object.assign(whereCategory, { id: categories });

  const whereFeature = {};

  if (filters) {
    const orArray = [];
    filters.forEach((item) => {
      orArray.push({
        [Op.and]: [
          {
            key: item.key,
          },
          {
            value: item.value,
          },
        ],
      });
    });

    Object.assign(whereFeature, {
      [Op.or]: orArray,
    });
  }
  const includeArray = [
    {
      model: db.image,
      attributes: ["largeUrl", "mediumUrl", "smallUrl", "thumbnailHdUrl"],
    },
    {
      model: db.category,
      attributes: ["id", "name", "slug", "parrent", "order", "activated"],
      required: !!categories,
      where: whereCategory,
      attributes: [],
      through: {
        attributes: [],
      },
    },
    {
      model: db.feature,
      attributes: [],
      required: !!filters && filters.length,
      where: whereFeature,
    },
  ];
  return new Promise((resolve, reject) => {
    db.room
      .findAll({
        where: thisWhere,
        include: includeArray,
        order: [[db.Sequelize.literal("rand()")]],
      })
      .then((rooms) => {
        const arrayRoom = _utils.getUniqueListBy(rooms, "modelId");
        resolve({ rooms: arrayRoom });
      })
      .catch((err) => {
        reject({ status: 500, data: { err, error: "Error on room.findAll" } });
      });
  });
};

const findOne = (props, environement) => {
  const db = databases[environement || "development"];
  const { where, id } = props;
  const thisWhere = {
    id,
    status: ["waiting", "activated"],
  };
  if (where) Object.assign(thisWhere, where);

  const includeArray = [
    {
      model: db.image,
      attributes: [
        "url",
        "largeUrl",
        "mediumUrl",
        "smallUrl",
        "thumbnailHdUrl",
      ],
    },
    {
      model: db.category,
      attributes: ["id", "name", "slug", "parrent", "order", "activated"],
      through: {
        attributes: [],
      },
    },
    {
      model: db.feature,
      attributes: ["id", "key", "type", "value"],
    },
    {
      model: db.group,
      required: false,
      where: {
        activated: true,
      },
      attributes: [
        "id",
        "name",
        "message",
        "min",
        "max",
        "multiple",
        "activated",
      ],
      through: {
        attributes: [],
      },
      include: [
        {
          model: db.option,
          required: false,
          attributes: ["id", "name", "activated"],
          through: {
            attributes: ["price", "multiple", "max"],
          },
        },
      ],
    },
  ];

  return new Promise((resolve, reject) => {
    db.room
      .findOne({
        where: thisWhere,
        include: includeArray,
      })
      .then((room) => {
        if (!room) {
          return reject({
            status: 404,
            data: { err: {}, error: "Room not found" },
          });
        }
        resolve({ room });
      })
      .catch((err) => {
        reject({ status: 500, data: { err, error: "Error on room.findOne" } });
      });
  });
};

const getFilters = (props, environement) => {
  const db = databases[environement || "development"];
  const { shopId, category } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await _category.getCategories(
        { shopId, category },
        environement
      );
      const whereCat = {};
      if (category) whereCat.categoryId = category;

      const features = await db.feature.findAll({
        include: [
          {
            model: db.room,
            required: true,
            attributes: [],
            include: [
              {
                model: db.category,
                attributes: [],
                required: !!category,
                through: {
                  where: whereCat,
                },
              },
              { model: db.shop, where: { id: shopId }, attributes: [] },
            ],
          },
        ],
        //group: [["key"], ["value"]],
      });
      const uniqueKey = _utils.getUniqueListBy(features, "key");
      const uniqueValue = _utils.getUniqueListBy(uniqueKey, "value");
      resolve({ categories, features });
    } catch (error) {
      reject({ status: 500, error });
    }
  });
};

module.exports = {
  findAll,
  findOne,
  getFilters,
};
