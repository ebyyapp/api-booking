const databases = require("../../models");

const setRoomCategories = (props, environement) => {
  const db = databases[environement || "development"];
  const { body, roomId } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const { categoryIds, action } = body;
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
            const categories = await db.category.findAll({
              where: { id: categoryIds },
            });
            switch (action) {
              case "add":
                await room.addCategories(categories);
                break;
              case "update":
                await room.setCategories(categories);
                break;
              case "delete":
                console.log(categories);
                await room.removeCategories(categories);
                break;

              default:
                break;
            }
            const newRoom = await db.room.findOne({
              where: { id: roomId },
              include: db.category,
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
  setRoomCategories,
};
