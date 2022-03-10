const databases = require("../models");

const getIdsByCat = async ({ shopId, id }, environement) => {
  const db = databases[environement || "development"];

  try {
    const categories = await db.category.findAll({
      include: [
        {
          model: db.room,
          required: true,
          attributes: [],
          include: [{ model: db.shop, where: { id: shopId }, attributes: [] }],
        },
      ],
    });
    const getIdsCat = (id) => {
      let array = [];
      const childs = categories.filter((el) => el.parrent === id);
      childs.forEach((item) => {
        const thisChilds = categories.filter((el) => el.parrent === item.id);
        if (thisChilds.length) {
          const result = getIdsCat(item.id);
          array = array.concat(result);
        }
        if (!array.find((el) => el === item.id)) {
          array.push(item.id);
        }
      });
      if (!array.find((el) => el === id)) {
        array.push(id);
      }
      return array;
    };
    return getIdsCat(id);
  } catch (error) {
    return { status: 500, error };
  }
};

const getCategories = (props, environement) => {
  const db = databases[environement || "development"];

  const { shopId, category } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const where = {};
      if (category) where.id = category;

      const categories = await db.category.findAll({
        where,
        include: [
          {
            model: db.room,
            required: true,
            attributes: [],
            include: [
              { model: db.shop, where: { id: shopId }, attributes: [] },
            ],
          },
        ],
      });
      const getChilds = (id) => {
        const childs = categories.filter((el) => el.parrent === id);
        return childs;
      };

      const formatCategories = (data) => {
        const array = [];
        const categories = data.filter((el) => {
          const findParrent = data.find((item) => item.id === el.parrent);
          return el.parrent === null || !findParrent;
        });
        categories.forEach((category) => {
          const result = getChilds(category.id);
          if (result.length) {
            const array2 = formatCategories(result);
            array.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              imageUrl: category.imageUrl,
              parrent: category.parrent,
              order: category.order,
              activated: category.activated,
              childs: array2,
            });
          } else {
            array.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              imageUrl: category.imageUrl,
              parrent: category.parrent,
              order: category.order,
              activated: category.activated,
              childs: result,
            });
          }
        });
        return array;
      };

      resolve(formatCategories(categories));
    } catch (error) {
      console.log(error);
      reject({ status: 500, error });
    }
  });
};

module.exports = {
  getCategories,
  getIdsByCat,
};
