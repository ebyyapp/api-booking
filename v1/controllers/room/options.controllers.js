const { ObjectOf } = require("../../../propstypes");
const { setRoomOptions } = require("../../configs/rules.configs");
const _options = require("../../functions/room/options.functions");

exports.setRoomOprions = async (req, res) => {
  const { environement } = req;
  const { roomId } = req.params;
  const result = ObjectOf(req.body, setRoomOptions);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  _options
    .setRoomOptions({ body: req.body, roomId }, environement)
    .then((room) => {
      res.send(room);
    })
    .catch((err) => {
      res.status(err?.status || 500).send(err?.data || {});
    });
};
