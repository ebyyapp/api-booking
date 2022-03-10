const { Op } = require("sequelize");
const databases = require("../models");

const addTime = (body, environement) => {
  const db = databases[environement || "development"];
  const { start, end, availablityId } = body;
  return new Promise((resolve, reject) => {
    db.time
      .findOne({
        where: {
          [Op.or]: [
            {
              [Op.or]: [
                {
                  [Op.and]: [
                    {
                      start: {
                        [Op.gte]: start,
                      },
                    },
                    {
                      start: {
                        [Op.lt]: end,
                      },
                    },
                    {
                      availablityId,
                    },
                  ],
                },
                {
                  [Op.and]: [
                    {
                      end: {
                        [Op.gt]: start,
                      },
                    },
                    {
                      end: {
                        [Op.lte]: end,
                      },
                    },
                    {
                      availablityId,
                    },
                  ],
                },
              ],
            },
          ],
        },
      })
      .then((response) => {
        if (!response) {
          db.time
            .create(body)
            .then((time) => resolve(time))
            .catch((err) => reject({ err, error: "Error on time.create" }));
        } else {
          reject({
            err: {
              message: "La plage est en confli avec une autre",
              body,
              response,
            },
            error: "Already existing",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          err,
          error: "Error on time.findOne",
        });
      });
  });
};

module.exports = {
  addTime,
};
