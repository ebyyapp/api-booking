const databases = require("../../models");

const setRoomOptions = (props, environement) => {
  const db = databases[environement || "development"];
  const { body, roomId } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const { groupIds, action } = body;

      const room = await db.room.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return reject({
          status: 404,
          data: {
            err: {},
            error: "Room not found",
          },
        });
      }
      const getGroups = await db.group.findAll({ where: { id: groupIds } });

      switch (action) {
        case "add":
          await room.addGroups(getGroups);
          break;
        case "update":
          await room.setGroups(getGroups);
          break;
        case "delete":
          await room.removeGroups(getGroups);
          break;

        default:
          break;
      }

      const newRoom = await db.room.findOne({
        where: { id: roomId },
        include: db.group,
      });

      resolve(newRoom);
    } catch (err) {
      console.log(err);
      reject({
        status: 500,
        data: {
          err,
          error: "Error Server",
        },
      });
    }
  });
};

module.exports = {
  setRoomOptions,
};
