const moment = require("moment");
const _fUtils = require("../../functions/utils.function");
const _interval = require("../functions/availablities/interval.functions");
const _day = require("../functions/availablities/day.functions");
const _miltidays = require("../functions/availablities/multidays.functions");
const _alerts = require("../functions/alerts.functions");
const { ObjectOf, PropTypes } = require("../../propstypes");
const { booking } = require("../configs/rules.configs");
const _booking = require("../functions/booking.functions");

exports.newBooking = (req, res) => {
  const { db, environement } = req;
  const {
    roomId,
    startDate,
    endDate,
    timeId,
    description,
    addresses,
    quantity,
  } = req.body;
  const options = req.body.options || [];
  const payments = req.body.payments || [];
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);

  const result = ObjectOf(req.body, booking);
  if (!result.correct) {
    return res.status(result?.status || 500).json(result || {});
  }

  db.room
    .findOne({
      where: { id: roomId, status: "activated" },
      include: [{ model: db.shop }, { model: db.group }],
    })
    .then(async (room) => {
      if (room) {
        const {
          deferredValue,
          min,
          price,
          acceptance,
          minDays,
          groups,
          reminderH,
          cancelIfAfter,
          startTime,
        } = room;
        //******************************* Options  */
        const bookingOptions = await _booking.checkOptions(
          { groups, options },
          environement
        );
        let sumOptions = 0;
        options.forEach((option) => {
          option.items.forEach((item) => {
            sumOptions += item.price * item.quantity;
          });
        });
        //******************************************/

        // Payments un tableau d'ids que je dois récupérer depuis l'api paiements
        const body = {
          roomId,
          type: room.type,
          startDate,
          description,
          quantity,
          priceU: price,
          priceT: (price + sumOptions) * quantity,
          userId: req.user.id,
          status: acceptance === "automatic" ? "accepted" : "waiting",
        };
        switch (room.type) {
          case "INTERVAL":
            //----------------- Field timeId Validation
            const CheckTimeID = ObjectOf(req.body, {
              timeId: PropTypes().isRequired().isString(),
            });
            if (!CheckTimeID.correct) {
              return res
                .status(CheckTimeID?.status || 500)
                .json(CheckTimeID || {});
            }
            //-------------------------------------------
            const checkIntervalDate = await _interval.isDateEnabel(
              {
                roomId,
                timeId,
                date: startDate,
                deferredValue,
                quantity,
                min,
              },
              environement
            );
            if (!checkIntervalDate.status) {
              return res.status(400).send({
                startDate: "This date is not available",
              });
            }

            Object.assign(body, { timeId });
            break;
          case "DAY":
            const checkDayDate = await _day.isDateEnabel(
              {
                roomId,
                date: startDate,
                deferredValue,
                quantity,
                min,
              },
              environement
            );
            if (!checkDayDate.status) {
              return res.status(400).send({
                startDate: "This date is not available",
              });
            }
            break;
          case "MULTIDAYS":
            //----------------- Field endDate Validation
            const CheckEndDate = ObjectOf(req.body, {
              endDate: PropTypes()
                .isRequired()
                .isDate()
                .isGt(momentStartDate.format("YYYY-MM-DD")),
            });
            if (!CheckEndDate.correct) {
              return res
                .status(CheckEndDate?.status || 500)
                .json(CheckEndDate || {});
            }
            //-------------------------------------------
            const checkMultiDaysDate = await _miltidays.isDateEnabel(
              {
                roomId,
                startDate,
                endDate,
                deferredValue,
                quantity,
                min,
              },
              environement
            );
            if (!checkMultiDaysDate.status) {
              return res.status(400).send({
                startDate: "This date is not available",
              });
            }
            const diff = momentEndDate.diff(momentStartDate, "days");
            if (diff < minDays) {
              return res.status(400).send({
                minDays: `Minimum required ${minDays} days`,
              });
            }
            Object.assign(body, { endDate });
            break;
          default:
            return res
              .status(400)
              .send({ err: {}, error: "Room type incorrect" });
        }
        db.booking
          .create(body)
          .then(async (booking) => {
            if (addresses) {
              if (!addresses.billing) {
                Object.assign(addresses, {
                  billing: addresses.delivery,
                });
              }
              const promises = Object.entries(addresses).map(
                async ([key, value]) => {
                  if (key && value) {
                    try {
                      const res_address = await _fUtils.getAddressGeoCoding(
                        value
                      );
                      const address = res_address[0];
                      const o = {
                        address: `${address.streetNumber} ${address.streetName}`,
                        zipCode: address.zipcode,
                        city: address.city,
                        country: address.country,
                        countryCode: address.countryCode,
                        department: address.administrativeLevels.level2long,
                        region: address.administrativeLevels.level1long,
                        type: key,
                        lat: address.latitude,
                        lng: address.longitude,
                        bookingId: booking.id,
                      };
                      return await db.address.create(o);
                    } catch (error) {}
                  }
                }
              );
              await Promise.all(promises);
            }

            const addOptions = await db.bookingOption.bulkCreate(
              bookingOptions,
              {
                returning: true,
              }
            );
            await booking.addBookingOptions(addOptions);

            //***************************** Alerts */
            if (reminderH) {
              const datetime =
                momentStartDate.format("YYYY-MM-DD") + " " + startTime;
              const timeZone = moment(datetime)
                .tz("Europe/Paris")
                .format("YYYY-MM-DD HH:mm:ss");
              const alertDate = moment(timeZone)
                .subtract(reminderH, "hours")
                .toDate();

              const alert = await db.alert.create({
                date: alertDate,
                table: "booking",
                linkId: booking.id,
                action: "reminderConfirmBooking",
                userId: req.user.id,
                shopId: room.shopId,
              });
              _alerts.addAlert(
                {
                  id: alert.id,
                  date: alertDate,
                  table: "booking",
                  linkId: booking.id,
                  action: "reminderConfirmBooking",
                  userId: req.user.id,
                },
                environement
              );
            }
            if (cancelIfAfter) {
              const datetime =
                momentStartDate.format("YYYY-MM-DD") + " " + startTime;
              const timeZone = moment(datetime)
                .tz("Europe/Paris")
                .format("YYYY-MM-DD HH:mm:ss");
              const alertDate = moment(timeZone)
                .subtract(cancelIfAfter, "hours")
                .toDate();

              const alert = await db.alert.create({
                date: alertDate,
                table: "booking",
                linkId: booking.id,
                action: "cancelIfNotConfirm",
                userId: req.user.id,
                shopId: room.shopId,
              });
              _alerts.addAlert(
                {
                  id: alert.id,
                  date: alertDate,
                  table: "booking",
                  linkId: booking.id,
                  action: "cancelIfNotConfirm",
                  userId: req.user.id,
                },
                environement
              );
            }

            const timeZone = moment()
              .tz("Europe/Paris")
              .format("YYYY-MM-DD HH:mm:ss");
            const alertDate = moment(timeZone).add(24, "hours").toDate();

            const alert = await db.alert.create({
              date: alertDate,
              table: "booking",
              linkId: booking.id,
              action: "cancelIfNotAccept",
              userId: req.user.id,
              shopId: room.shopId,
            });
            await _alerts.addAlert(
              {
                id: alert.id,
                date: alertDate,
                table: "booking",
                linkId: booking.id,
                action: "cancelIfNotAccept",
                userId: req.user.id,
              },
              environement
            );

            //*************************************/

            const newBooking = await db.booking.findOne({
              where: { id: booking.id },
              include: [
                {
                  model: db.room,
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
              ],
            });
            res.send(newBooking);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ err, error: "Error on booking.create" });
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
      res
        .status(err?.status || 500)
        .json(err?.data || { err, error: "Error Server" });
    });
};

exports.getUserBookings = async (req, res) => {
  const { environement } = req;
  try {
    const { startDate, endDate, dateFilter, status } = req.query;
    const bookings = await _booking.getBookings(
      {
        type: "user",
        userId: req.user.id,
        status,
        startDate,
        endDate,
        dateFilter,
      },
      environement
    );
    res.send(bookings);
  } catch (err) {
    console.log(err);
    res
      .status(err?.status || 500)
      .json(err?.data || { err, error: "Error Server" });
  }
};

exports.getShopBookings = async (req, res) => {
  const { environement } = req;
  try {
    const { startDate, endDate, dateFilter, status } = req.query;
    const bookings = await _booking.getBookings(
      {
        type: "shop",
        shopId: req.shop.id,
        status,
        startDate,
        endDate,
        dateFilter,
      },
      environement
    );
    res.send(bookings);
  } catch (err) {
    console.log(err);
    res
      .status(err?.status || 500)
      .json(err?.data || { err, error: "Error Server" });
  }
};
exports.getRoomBookings = async (req, res) => {
  const { environement } = req;
  try {
    const { startDate, endDate, dateFilter, status } = req.query;
    const { roomId } = req.params;
    const bookings = await _booking.getBookings(
      {
        type: "room",
        roomId,
        status,
        startDate,
        endDate,
        dateFilter,
      },
      environement
    );
    res.send(bookings);
  } catch (err) {
    console.log(err);
    res
      .status(err?.status || 500)
      .json(err?.data || { err, error: "Error Server" });
  }
};
