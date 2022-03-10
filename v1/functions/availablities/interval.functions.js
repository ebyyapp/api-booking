const databases = require("../../models");

const { Op } = require("sequelize");

const getTimesEnabled = (times, date, min) => {
  const minimum = min || 1;
  const hours = times.map((time) => {
    const { bookings } = time;
    const bookingsOfDate = bookings.filter((el) =>
      moment(el.startDate).isSame(date, "day")
    );
    const booked = bookingsOfDate.reduce((prev, cur) => {
      const quantity = cur?.quantity || 1;
      return prev + quantity;
    }, 0);
    const remaining = time.seats - booked;
    return {
      id: time.id,
      start: time.start,
      end: time.end,
      seats: remaining >= minimum ? remaining : 0,
    };
  });
  return hours;
};

const getDatesBetween = (startDate, lastDate) => {
  const momentStartDate = moment(startDate).subtract(1, "day").startOf("day");
  const momentLastDate = moment(lastDate).endOf("day");
  const dates = [];
  while (momentStartDate.add(1, "days").diff(momentLastDate) < 0) {
    dates.push(momentStartDate.clone().toDate());
  }

  return dates;
};

const checkDateAvailability = ({
  availablities,
  startDate,
  date,
  deferredValue,
  min,
}) => {
  const firstDate = moment(date).startOf("day");
  if (date < startDate)
    return {
      status: false,
      date,
    };

  if (deferredValue) {
    const timeZone = moment().tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
    const current = moment(timeZone).toDate();
    const diffrence = firstDate.diff(current, "days");
    if (diffrence < deferredValue) {
      return {
        status: false,
        date,
      };
    }
  }
  const dayId = moment(date).day();
  const getAvailablityByDate = availablities.find((el) =>
    moment(el.date).isSame(date, "day")
  );
  const getAvailablityByDayId = availablities.find(
    (el) => el.dayId === dayId && !el.date
  );
  const availablity = getAvailablityByDate || getAvailablityByDayId;
  if (!availablity)
    return {
      status: false,
      date,
    };
  const timesEnabled = getTimesEnabled(availablity.times, date, min);
  if (timesEnabled.length) {
    return {
      status: true,
      data: {
        dayId,
        date,
        roomId: availablity.roomId,
        times: timesEnabled,
      },
    };
  } else {
    return {
      status: false,
      date,
    };
  }
};

const getDates = (body, environement) => {
  const db = databases[environement || "development"];
  const { roomId, startDate, deferredValue, min } = body;
  const momentStartDate = moment(startDate);
  const momentEndOfMounth = momentStartDate.endOf("month");
  const endOfMounth = momentEndOfMounth.toDate();

  return new Promise((resolve, reject) => {
    db.availablity
      .findAll({
        where: {
          [Op.and]: [
            {
              roomId,
              activated: true,
            },
            {
              [Op.or]: [
                {
                  date: null,
                },
                {
                  date: { [Op.between]: [startDate, endOfMounth] },
                },
              ],
            },
          ],
        },
        include: [
          {
            model: db.time,
            where: { activated: true },
            required: false,
            attributes: ["id", "start", "end", "seats"],
            include: [
              {
                model: db.booking,
                required: false,
                attributes: ["id", "startDate", "quantity"],
                where: {
                  type: "INTERVAL",
                  status: ["waiting", "accepted", "toConfirm", "confirmed"],
                },
              },
            ],
          },
        ],
        order: [[db.time, "start", "ASC"]],
      })
      .then((availablities) => {
        const dates = getDatesBetween(startDate, endOfMounth);
        const enabled = [];
        const disabled = [];
        dates.map((date) => {
          const func = checkDateAvailability({
            availablities,
            startDate,
            date,
            deferredValue,
            min,
          });
          if (func.status) {
            enabled.push(func.data);
          } else {
            disabled.push(func.date);
          }
        });
        resolve({
          enabled: { countDays: enabled.length, data: enabled },
          disabled: { countDays: disabled.length, data: disabled },
        });
      })
      .catch((err) => {
        console.log(err);
        reject({ err, error: "Error on availablity.findAll" });
      });
  });
};

const isDateEnabel = (body, environement) => {
  const db = databases[environement || "development"];
  const { roomId, timeId, date, deferredValue, min, quantity } = body;
  const quant = quantity || 1;
  const momentDate = moment(date);
  const timeZone = moment().tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  const current = moment(timeZone).startOf("day");
  const startOfDay = momentDate.startOf("day").toDate();
  const endOfDay = momentDate.endOf("day").toDate();
  const dayId = momentDate.day();
  return new Promise((resolve, reject) => {
    if (!current.isSameOrBefore(startOfDay, "day")) {
      return resolve({ status: false });
    }
    db.availablity
      .findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  [Op.and]: [
                    {
                      dayId,
                    },
                    {
                      date: null,
                    },
                  ],
                },
                {
                  date: { [Op.between]: [startOfDay, endOfDay] },
                },
              ],
            },
            {
              roomId,
            },
          ],
        },
        include: [
          {
            model: db.time,
            where: { activated: true, id: timeId },
            required: true,
            attributes: ["id", "start", "end", "seats"],
            include: [
              {
                model: db.booking,
                required: false,
                attributes: ["id", "startDate", "quantity"],
                where: {
                  type: "INTERVAL",
                  status: ["waiting", "accepted", "toConfirm", "confirmed"],
                },
              },
            ],
          },
        ],
        order: [[db.time, "start", "ASC"]],
      })
      .then((availablities) => {
        if (!availablities.length) {
          return resolve({ status: false });
        }
        const check = checkDateAvailability({
          availablities,
          startDate: date,
          date,
          deferredValue,
          min,
        });
        if (!check.status) {
          return resolve({ status: false });
        }
        const { data } = check;
        const { times } = data;
        const remaining = times.filter(
          (el) => el.seats >= min && el.seats >= quant
        );
        if (!remaining.length) {
          return resolve({ status: false });
        }

        resolve({ status: true });
      })
      .catch((err) => {
        console.log(err);
        reject({ err, error: "Error on availablity.findAll" });
      });
  });
};
module.exports = {
  getDates,
  isDateEnabel,
};
