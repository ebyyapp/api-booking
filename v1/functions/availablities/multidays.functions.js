const databases = require("../../models");

const { Op } = require("sequelize");

const getDatesBetween = (startDate, lastDate, slice) => {
  const momentStartDate = moment(startDate).subtract(1, "day").startOf("day");
  const momentLastDate = moment(lastDate).endOf("day");
  const dates = [];
  while (momentStartDate.add(1, "days").diff(momentLastDate) < 0) {
    dates.push(momentStartDate.clone().toDate());
  }
  if (slice === "hideEnd") {
    return dates.slice(0, dates.length - 1);
  }
  return dates;
};
const checkDateAvailability = ({
  availablities,
  date,
  deferredValue,
  min,
  bookings,
}) => {
  const firstDate = moment(date).startOf("day");
  if (deferredValue) {
    const timeZone = moment().tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
    const current = moment(timeZone).toDate();
    const diffrence = firstDate.diff(current, "days");
    if (diffrence < deferredValue) {
      return { status: false, date };
    }
  }
  const dayId = moment(date).day();
  const availablity = availablities.find((el) =>
    moment(el.date).isSame(date, "day")
  );
  if (!availablity) {
    return { status: false, date };
  }
  const bookingsOfDate = bookings.filter(
    (el) =>
      moment(el.startDate).isSameOrBefore(date, "day") &&
      moment(el.endDate).isAfter(date, "day")
  );
  const booked = bookingsOfDate.reduce((prev, cur) => {
    const quantity = cur?.quantity || 1;
    return prev + quantity;
  }, 0);
  const remaining = availablity.seats - booked;
  const minimum = min || 1;
  if (remaining < minimum) {
    return { status: false, date };
  }
  return {
    status: true,
    data: {
      dayId,
      date,
      roomId: availablity.roomId,
      seats: remaining,
    },
  };
};
const getDates = (body, environement) => {
  const db = databases[environement || "development"];
  const { roomId, startDate, deferredValue, min } = body;
  const momentStartDate = moment(startDate);
  const momentEndOfMounth = momentStartDate.add(1, "month").endOf("month");
  const endOfMounth = momentEndOfMounth.toDate();

  return new Promise((resolve, reject) => {
    db.availablity
      .findAll({
        where: {
          roomId,
          activated: true,
          date: { [Op.between]: [startDate, endOfMounth] },
        },
      })
      .then(async (availablities) => {
        const dates = getDatesBetween(startDate, endOfMounth);
        const bookings = await db.booking.findAll({
          where: {
            type: "MULTIDAYS",
            status: ["waiting", "accepted", "toConfirm", "confirmed"],
            startDate: { [Op.ne]: null },
            endDate: { [Op.gt]: startDate },
            roomId,
          },
        });
        const enabled = [];
        const disabled = [];
        dates.map((date) => {
          const func = checkDateAvailability({
            availablities,
            bookings,
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
  const { roomId, startDate, endDate, deferredValue, min, quantity } = body;
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);
  const startOfDay = momentStartDate.startOf("day").toDate();
  const endOfDay = momentEndDate.endOf("day").toDate();
  const timeZone = moment().tz("Europe/Paris").format("YYYY-MM-DD HH:mm:ss");
  const current = moment(timeZone).startOf("day").toDate();

  return new Promise((resolve, reject) => {
    if (!current.isSameOrBefore(startOfDay, "day")) {
      return resolve({ status: false });
    }
    db.availablity
      .findAll({
        where: {
          roomId,
          activated: true,
          date: { [Op.between]: [startOfDay, endOfDay] },
        },
      })
      .then(async (availablities) => {
        const dates = getDatesBetween(startOfDay, endOfDay, "hideEnd");
        const bookings = await db.booking.findAll({
          where: {
            type: "MULTIDAYS",
            status: ["waiting", "accepted", "toConfirm", "confirmed"],
            startDate: { [Op.ne]: null },
            endDate: { [Op.gt]: startOfDay },
            roomId,
          },
        });
        let status = true;
        dates.map((date) => {
          const func = checkDateAvailability({
            availablities,
            bookings,
            startDate,
            date,
            deferredValue,
            min,
          });
          if (!func.status) {
            status = false;
          } else {
            const seats = func.data.seats;
            const quant = quantity || 1;
            if (seats < quant) {
              status = false;
            }
          }
        });
        resolve({ status: status });
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
