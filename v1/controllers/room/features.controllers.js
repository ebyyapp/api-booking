const _features = require("../../functions/room/features.functions");
const { ObjectOf } = require("../../../propstypes");
const { newFeatures, deleteFeatures } = require("../../configs/rules.configs");

exports.addFeatures = async (req, res) => {
  const { environement } = req;
  const { roomId } = req.params;
  const { features } = req.body;
  const result = ObjectOf(req.body, newFeatures);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result.data || {});
  }

  _features
    .addFeatures({ features, roomId }, environement)
    .then((room) => {
      res.send(room);
    })
    .catch((err) => {
      res.status(err?.status || 500).send(err?.data || {});
    });
};

exports.deleteFeatures = async (req, res) => {
  const { db, environement } = req;
  const result = ObjectOf(req.body, deleteFeatures);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  try {
    await db.feature
      .destroy({
        where: {
          id: req.body.ids,
        },
      })
      .then((count) => {
        res.send(`${count} Features deleted`);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ err, error: "Error on feature.destroy" });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};
