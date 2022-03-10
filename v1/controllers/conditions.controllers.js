const { ObjectOf } = require("../../propstypes");
const { setConditions } = require("../configs/rules.configs");

exports.setConditions = async (req, res) => {
  const { db, environement } = req;
  try {
    const { groupId } = req.params;
    const { optionIds, action } = req.body;
    const result = ObjectOf(req.body, setConditions);
    if (!result.correct) {
      return res.status(result?.status || 500).json(result || {});
    }
    const group = await db.group.findOne({
      where: { id: groupId },
    });
    if (!group) {
      return res.status(404).send({ err: {}, error: "Group not found" });
    }
    const getOptions = await db.option.findAll({ where: { id: optionIds } });

    switch (action) {
      case "add":
        await group.addOptions(getOptions, { through: req.body });
        break;
      case "update":
        await group.setOptions(getOptions, { through: req.body });
        break;
      case "delete":
        await group.removeOptions(getOptions, { through: req.body });
        break;

      default:
        break;
    }

    const newGroup = await db.group.findOne({
      where: { id: groupId },
      include: db.option,
    });

    res.send(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};
