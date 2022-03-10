const databases = require("../../models");

const addFeatures = (props, environement) => {
  const db = databases[environement || "development"];
  const { features, roomId } = props;
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
            const arrayFeatures = await db.feature.bulkCreate(features, {
              returning: true,
            });
            await room.addFeatures(arrayFeatures);
            const newRoom = await db.room.findOne({
              where: { id: roomId },
              include: db.feature,
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
  addFeatures,
};
