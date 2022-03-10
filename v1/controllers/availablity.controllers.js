//availablity
const _fUtilsLocal = require("../functions/utils.functions");
const _fTimes = require("../functions/time.functions");
const _interval = require("../functions/availablities/interval.functions");
const _day = require("../functions/availablities/day.functions");
const _miltidays = require("../functions/availablities/multidays.functions");
const moment = require("moment");
const { Op } = require("sequelize");
const { ObjectOf, PropTypes } = require("../../propstypes");
const { availablity } = require("../configs/rules.configs");

exports.newAvailablity = async (req, res) => {
  const { db, environement } = req;
  const { roomId, dayId, date, times } = req.body;

  const result = ObjectOf(req.body, availablity);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }

  if (date) {
    Object.assign(req.body, { dayId: moment(date).day() });
  }
  db.room
    .findOne({ where: { id: roomId }, include: [{ model: db.shop }] })
    .then(async (room) => {
      if (room) {
        if (room.type === "INTERVAL") {
          Object.assign(availablity, {
            times: PropTypes().isRequired().isArrayOf({
              start: PropTypes().isRequired().isString(),
              end: PropTypes().isRequired().isString(),
              seats: PropTypes().isRequired().isNumber(),
            }),
          });
          const result = ObjectOf(req.body, availablity);
          if (!result.correct) {
            return res.status(result?.status || 500).json(result);
          }
        }

        _fUtilsLocal
          .verifyShopBelongsToUser(room.shop.shopId, req.user)
          .then(() => {
            db.availablity
              .findOne({
                where: {
                  roomId,
                  dayId: dayId,
                  date: date
                    ? {
                        [Op.between]: [
                          moment(date).startOf("day"),
                          moment(date).endOf("day"),
                        ],
                      }
                    : null,
                },
              })
              .then((countAv) => {
                if (!countAv) {
                  db.availablity
                    .create(req.body)
                    .then(async (availablity) => {
                      if (times && times.length) {
                        const promises = times.map(async (time) => {
                          const o = Object.assign(time, {
                            availablityId: availablity.id,
                          });
                          const result = await _fTimes.addTime(o, environement);
                          return result;
                        });

                        const res_times = await Promise.all(promises);
                      }
                      res.send(availablity);
                    })
                    .catch((err) => {
                      console.log(err);
                      res
                        .status(500)
                        .json({ err, error: "Error on availability.create" });
                    });
                } else {
                  res.status(409).json({
                    err: {},
                    error: "Already existing",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .json({ err, error: "Error on availability.count" });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(401).json(err);
          });
      } else {
        res.status(404).json({
          err: {
            item: "roomId",
            value: "La chambre est introuvable",
          },
          error: "Not found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err, error: "Error on room.findone" });
    });
};

exports.getDates = (req, res) => {
  const { db, environement } = req;
  const { roomId } = req.params;

  const CheckParams = ObjectOf(req.params, {
    roomId: PropTypes().isRequired().isString(),
  });

  if (!CheckParams.correct) {
    return res.status(CheckParams?.status || 500).json(CheckParams || {});
  }

  const CheckQuery = ObjectOf(req.query, {
    startDate: PropTypes().isRequired().isDate(),
  });
  if (!CheckQuery.correct) {
    return res.status(CheckQuery?.status || 500).json(CheckQuery || {});
  }

  db.room
    .findOne({ where: { id: roomId }, include: [{ model: db.shop }] })
    .then(async (room) => {
      if (room) {
        const type_booking = room.type;
        const { deferredValue, min } = room;
        const timeZone = moment(req.query.startDate)
          .tz("Europe/Paris")
          .format("YYYY-MM-DD HH:mm:ss");
        const startDate = moment(timeZone).startOf("day").toDate();
        switch (type_booking) {
          case "INTERVAL":
            _interval
              .getDates(
                {
                  roomId,
                  deferredValue,
                  min,
                  startDate,
                },
                environement
              )
              .then((dates) => {
                res.send(dates);
              })
              .catch((err) => res.status(500).json(err));
            break;
          case "DAY":
            _day
              .getDates(
                {
                  roomId,
                  deferredValue,
                  min,
                  startDate,
                },
                environement
              )
              .then((dates) => {
                res.send(dates);
              })
              .catch((err) => res.status(500).json(err));
            break;
          case "MULTIDAYS":
            _miltidays
              .getDates(
                {
                  roomId,
                  deferredValue,
                  min,
                  startDate,
                },
                environement
              )
              .then((dates) => {
                res.send(dates);
              })
              .catch((err) => res.status(500).json(err));
            break;
          default:
            return res
              .status(400)
              .send({ err: {}, error: "Room type incorrect" });
            break;
        }
      } else {
        res.status(404).json({
          err: {
            item: "roomId",
            value: "La chambre est introuvable",
          },
          error: "Not found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err, error: "Error on room.findone" });
    });
};
