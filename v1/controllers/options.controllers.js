const { ObjectOf } = require("../../propstypes");
const { newOption, deleteOptions } = require("../configs/rules.configs");

exports.newOption = async (req, res) => {
  const { db, environement } = req;
  const { shop, body } = req;
  const result = ObjectOf(body, newOption);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    const option = await db.option.create(body);
    await shop.addOption(option);
    const newOption = await db.option.findOne({
      where: { id: option.id },
      include: db.shop,
    });
    res.send(newOption);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.getAllOptions = async (req, res) => {
  const { db, environement } = req;
  const { shop } = req;
  try {
    const options = await db.option.findAll({
      where: { shopId: shop.id },
    });
    res.send(options);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.update = async (req, res) => {
  const { db, environement } = req;
  const { body } = req;
  const { optionId } = req.params;
  try {
    await db.option.update(body, {
      where: { id: optionId },
    });
    const newOption = await db.option.findOne({ where: { id: optionId } });
    res.send(newOption);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.delete = async (req, res) => {
  const { db, environement } = req;
  const result = ObjectOf(req.body, deleteOptions);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    const count = await db.option.destroy({
      where: {
        id: req.body.ids,
      },
    });
    res.send(`${count} Options deleted`);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};
