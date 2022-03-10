const databases = require("../../models");

const addImages = (props, environement) => {
  const db = databases[environement || "development"];
  const { images, roomId } = props;
  return new Promise(async (resolve, reject) => {
    try {
      db.room
        .findOne({ where: { id: roomId } })
        .then(async (room) => {
          if (!room) {
            return reject({
              status: 404,
              data: {
                err: {},
                error: "Room not found",
              },
            });
          }
          try {
            const arrayImages = await db.image.bulkCreate(images, {
              returning: true,
            });
            await room.addImages(arrayImages);
            const newRoom = await db.room.findOne({
              where: { id: roomId },
              include: db.image,
            });
            resolve(newRoom);
          } catch (err) {
            console.log(err);
            reject({
              status: 500,
              data: { err, error: "Error on category.findAll" },
            });
          }
        })
        .catch((err) => {
          console.log(err);
          reject({
            status: 500,
            data: { err, error: "Error on room.findOne" },
          });
        });
    } catch (err) {
      reject({ status: 500, data: { err, error: "Error Server" } });
    }
  });
};

module.exports = {
  addImages,
};
