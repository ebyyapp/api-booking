const { ObjectOf } = require("../../propstypes");
const { newGroup, deleteGroups } = require("../configs/rules.configs");

exports.newGroup = async (req, res) => {
  const { db, environement } = req;
  const { shop, body } = req;
  const result = ObjectOf(body, newGroup);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    const group = await db.group.create(body);
    await shop.addGroup(group);
    const newGroup = await db.group.findOne({
      where: { id: group.id },
      include: db.shop,
    });
    res.send(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.getAllGroups = async (req, res) => {
  const { db, environement } = req;
  const { shop } = req;
  try {
    const groups = await db.group.findAll({
      where: { shopId: shop.id },
    });
    res.send(groups);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.update = async (req, res) => {
  const { db, environement } = req;
  const { body } = req;
  const { groupId } = req.params;
  try {
    await db.group.update(body, {
      where: { id: groupId },
    });
    const newGroup = await db.group.findOne({ where: { id: groupId } });
    res.send(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};

exports.delete = async (req, res) => {
  const { db, environement } = req;
  const result = ObjectOf(req.body, deleteGroups);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    const count = await db.group.destroy({
      where: {
        id: req.body.ids,
      },
    });
    res.send(`${count} Groups deleted`);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};
