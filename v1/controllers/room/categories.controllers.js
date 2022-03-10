const { ObjectOf } = require("../../../propstypes");
const { setRoomCategories } = require("../../configs/rules.configs");
const _category = require("../../functions/room/categories.functions");

exports.setRoomCategories = async (req, res) => {
  const { environement } = req;
  const { roomId } = req.params;

  const result = ObjectOf(req.body, setRoomCategories);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  _category
    .setRoomCategories({ body: req.body, roomId }, environement)
    .then(async (room) => {
      res.send(room);
    })
    .catch((err) => {
      console.log(err);
      res.status(err?.status || 500).send(err?.data || {});
    });
};
