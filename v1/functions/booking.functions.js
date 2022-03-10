const moment = require("moment");
const schedule = require("node-schedule");
const _users = require("./users.functions");
const _shops = require("./shops.functions");
const { Op } = require("sequelize");
const databases = require("../models");

const getBookings = (props, environement) => {
  const db = databases[environement || "development"];
  return new Promise(async (resolve, reject) => {
    try {
      const {
        type,
        shopId,
        userId,
        roomId,
        status,
        startDate,
        endDate,
        dateFilter,
      } = props;
      let bookings = [];
      const timeZone = moment().tz("Europe/Paris").format("YYYY-MM-DD");
      const current = moment(timeZone);
      const filterDate = {
        day: {
          [Op.between]: [
            current.startOf("day").toDate(),
            current.endOf("day").toDate(),
          ],
        },
        history: { [Op.lte]: current.endOf("day").toDate() },
        uncomming: { [Op.gt]: current.endOf("day").toDate() },
      };
      const momentStartDate = moment(startDate);
      const momentEndDate = moment(endDate);
      switch (type) {
        case "shop":
          const whereShop = {};
          if (status && status.length) whereShop.status = status;
          if (dateFilter) whereShop.startDate = filterDate[dateFilter];
          if (startDate && endDate)
            whereShop.startDate = {
              [Op.between]: [
                momentStartDate.startOf("day").toDate(),
                momentEndDate.endOf("day").toDate(),
              ],
            };
          bookings = await db.booking.findAll({
            where: whereShop,
            include: [
              {
                model: db.room,
                required: true,
                where: {
                  shopId,
                },
                include: db.shop,
              },
              {
                model: db.time,
              },
              {
                model: db.address,
              },
              {
                model: db.bookingOption,
              },
              {
                model: db.cancelReason,
              },
            ],
          });
          break;
        case "user":
          const whereUser = { userId };
          if (status && status.length) whereUser.status = status;
          if (dateFilter) whereUser.startDate = filterDate[dateFilter];
          if (startDate && endDate)
            whereUser.startDate = {
              [Op.between]: [
                momentStartDate.startOf("day").toDate(),
                momentEndDate.endOf("day").toDate(),
              ],
            };
          bookings = await db.booking.findAll({
            where: whereUser,
            include: [
              {
                model: db.room,
                include: db.shop,
              },
              {
                model: db.time,
              },
              {
                model: db.address,
              },
              {
                model: db.bookingOption,
              },
              {
                model: db.cancelReason,
              },
            ],
          });
          break;
        case "room":
          const whereRoom = { roomId };
          if (status && status.length) whereRoom.status = status;
          if (dateFilter) whereRoom.startDate = filterDate[dateFilter];
          if (startDate && endDate)
            whereRoom.startDate = {
              [Op.between]: [
                momentStartDate.startOf("day").toDate(),
                momentEndDate.endOf("day").toDate(),
              ],
            };
          bookings = await db.booking.findAll({
            where: whereRoom,
            include: [
              {
                model: db.room,
                include: db.shop,
              },
              {
                model: db.time,
              },
              {
                model: db.address,
              },
              {
                model: db.bookingOption,
              },
              {
                model: db.cancelReason,
              },
            ],
          });
          break;

        default:
          break;
      }
      const userIds = [];
      const shopIds = [];
      bookings.map((el) => {
        const idShop = el?.room?.shop?.shopId;
        if (!userIds.includes(el.userId)) {
          userIds.push(el.userId);
        }
        if (idShop && !shopIds.includes(idShop)) {
          shopIds.push(idShop);
        }
      });

      const users = await _users.fetchUsers({ userIds }, environement);
      const shops = await _shops.fetchShops({ shopIds }, environement);

      const arryBookings = [];
      bookings.forEach((booking) => {
        const user = users.find((el) => el.id === booking.userId) || null;
        const shop =
          shops.find((el) => el.id === booking?.room?.shop?.shopId) || null;
        const stringify = JSON.stringify(booking);
        const parse = JSON.parse(stringify);
        parse.user = user;
        parse.shop = shop;
        arryBookings.push(parse);
      });
      resolve(arryBookings);
    } catch (err) {
      reject({ status: 500, data: { err, error: "Error server" } });
    }
  });
};

const checkOptions = (props) => {
  const { groups, options } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const errors = {};
      const bookingOptions = [];
      groups.forEach((group) => {
        const findGroup = options.find((el) => el.id === group.id);
        if (group.min) {
          if (!findGroup) {
            return Object.assign(errors, { [group.name]: "Is required" });
          }
          const sumQuantity = findGroup.items.reduce((prev, cur) => {
            const quantity = cur?.quantity || 1;
            return prev + quantity;
          }, 0);
          if (sumQuantity < group.min) {
            return Object.assign(errors, {
              [group.name]: `Minimum required is ${group.min}`,
            });
          }
          if (group.max && sumQuantity > group.max) {
            return Object.assign(errors, {
              [group.name]: `Maximum required is ${group.max}`,
            });
          }
        } else {
          if (findGroup) {
            const sumQuantity = findGroup.items.reduce((prev, cur) => {
              const quantity = cur?.quantity || 1;
              return prev + quantity;
            }, 0);
            if (group.max && sumQuantity > group.max) {
              return Object.assign(errors, {
                [group.name]: `Maximum required is ${group.max}`,
              });
            }
          }
        }
        if (findGroup) {
          findGroup.items.forEach((item) => {
            bookingOptions.push({
              optionName: item.name,
              priceU: item.price,
              priceT: item.price * item.quantity,
              quantity: item.quantity,
              optionId: item.id,
              groupName: group.name,
              groupId: group.id,
            });
          });
        }
      });
      if (Object.keys(errors).length) {
        return reject({ status: 400, data: errors });
      }
      resolve(bookingOptions);
    } catch (err) {
      reject({ status: 500, data: { err, error: "Error server" } });
    }
  });
};

const cancelBooking = (props, environement) => {
  const db = databases[environement || "development"];
  const { id, reason } = props;
  return new Promise(async (resolve, reject) => {
    try {
      const booking = await db.booking.findOne({ where: { id } });
      await db.booking.update({ status: "canceled" }, { where: { id } });
      const cancelReason = await db.cancelReason.create({
        fr: reason,
      });
      await booking.setCancelReason(cancelReason);
      await db.cancelReason.destroy({ where: { bookingId: null } });
      //Send notification
      resolve({ status: 200 });
    } catch (err) {
      reject({ status: 500, data: { err, error: "Error server" } });
    }
  });
};

const reminderConfirmBooking = async (props, environement) => {
  const db = databases[environement || "development"];

  const { id, linkId, userId } = props;
  try {
    await db.alert.update({ status: "executed" }, { where: { id } });
    const booking = await db.booking.findOne({ where: { id: linkId } });
    if (!booking) return;
    if (booking.status === "accepted" || booking.status === "toConfirm") {
      await db.booking.update(
        { status: "toConfirm" },
        { where: { id: linkId } }
      );
      const room = await db.room.findOne({ where: { id: booking.roomId } });
      //Send notification to confirm
      const timeZone = moment()
        .tz("Europe/Paris")
        .format("YYYY-MM-DD HH:mm:ss");
      const alertDate = moment(timeZone).add(8, "hours").toDate();
      const alert = await db.alert.create({
        date: alertDate,
        table: "booking",
        linkId: booking.id,
        action: "reminderConfirmBooking",
        userId,
        shopId: room.shopId,
      });
      await schedule.scheduleJob(alert.id, alertDate, async () => {
        await reminderConfirmBooking({
          id: alert.id,
          linkId: booking.id,
          userId,
        });
        await schedule.cancelJob(alert.id);
      });
    } else {
      console.log("************ Not passed");
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelIfNotConfirm = async (props, environement) => {
  const db = databases[environement || "development"];

  const { id, linkId } = props;
  try {
    await db.alert.update({ status: "executed" }, { where: { id } });
    const booking = await db.booking.findOne({ where: { id: linkId } });
    if (!booking) return;
    if (booking.status !== "accepted" && booking.status !== "confirmed") {
      await cancelBooking({
        id: linkId,
        reason: "Non-confirmation de la réservation",
      });
    } else {
      console.log("************ Not passed");
    }
  } catch (error) {
    console.log(error);
  }
};
const cancelIfNotAccept = async (props, environement) => {
  const db = databases[environement || "development"];

  const { id, linkId } = props;
  try {
    await db.alert.update({ status: "executed" }, { where: { id } });
    const booking = await db.booking.findOne({ where: { id: linkId } });
    if (!booking) return;
    if (booking.status === "waiting") {
      await cancelBooking({
        id: linkId,
        reason: "Non-acceptation de la part du partenaire",
      });
    } else {
      console.log("************ Not passed");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  reminderConfirmBooking,
  cancelIfNotConfirm,
  cancelIfNotAccept,
  cancelBooking,
  checkOptions,
  getBookings,
};
