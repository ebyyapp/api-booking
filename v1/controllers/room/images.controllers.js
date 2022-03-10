const _images = require("../../functions/room/images.functions");
const { ObjectOf } = require("../../../propstypes");
const { newImades, deleteImages } = require("../../configs/rules.configs");

exports.addImages = async (req, res) => {
  const { environement } = req;
  const { roomId } = req.params;
  const { images } = req.body;
  const result = ObjectOf(req.body, newImades);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }
  const fields = ["largeUrl", "mediumUrl", "smallUrl", "thumbnailHdUrl"];
  const arrayImages = images.map((image) => {
    fields.forEach((field) => {
      if (!image[field]) {
        Object.assign(image, { [field]: image.url });
      }
    });
    return image;
  });

  _images
    .addImages({ images: arrayImages, roomId }, environement)
    .then((room) => {
      res.send(room);
    })
    .catch((err) => {
      res.status(err?.status || 500).send(err?.data || {});
    });
};

exports.deleteImages = async (req, res) => {
  const { db, environement } = req;
  try {
    const result = ObjectOf(req.body, deleteImages);
    if (!result.correct) {
      return res.status(result?.status || 500).json(result || {});
    }
    await db.image
      .destroy({
        where: {
          id: req.body.ids,
        },
      })
      .then((count) => {
        res.send(`${count} Images deleted`);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ err, error: "Error on image.destroy" });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err, error: "Error Server" });
  }
};
