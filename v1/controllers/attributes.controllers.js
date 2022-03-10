const { ObjectOf } = require("../../propstypes");
const { Op } = require("sequelize");
const { newAttributes, deleteAttributes } = require("../configs/rules.configs");

exports.newAttributes = async (req, res) => {
  const { db, environement } = req;
  const { roomId } = req.params;

  const result = ObjectOf(req.body, newAttributes);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    const { attributes } = req.body;
    const toDelete = [];
    const bodyAttributes = attributes.map((attribute) => {
      toDelete.push({ name: attribute.name, roomId });
      return {
        name: attribute.name,
        value: attribute.value,
        roomId,
      };
    });
    await db.attribute.destroy({
      where: {
        [Op.or]: toDelete,
      },
    });
    db.attribute
      .bulkCreate(bodyAttributes, {
        returning: true,
        updateOnDuplicate: ["name"],
      })
      .then(() => {
        res.send("Attributes created");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ err, error: "Error on attribute.bulkCreate" });
      });
  } catch (err) {
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.deleteAttributes = async (req, res) => {
  const { db, environement } = req;
  const result = ObjectOf(req.body, deleteAttributes);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    await db.attribute
      .destroy({
        where: {
          id: req.body.ids,
        },
      })
      .then(() => {
        res.send("Attributes deleted");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ err, error: "Error on attribute.destroy" });
      });
  } catch (err) {
    res.status(500).send({ err, error: "Error Server" });
  }
};
