const schedule = require("node-schedule");
const {
  reminderConfirmBooking,
  cancelIfNotConfirm,
  cancelIfNotAccept,
} = require("./booking.functions");

const functions = {
  booking: {
    reminderConfirmBooking: reminderConfirmBooking,
    cancelIfNotConfirm: cancelIfNotConfirm,
    cancelIfNotAccept: cancelIfNotAccept,
  },
};

const addAlert = async (props, environement) => {
  const { id, date, action, table, linkId, userId } = props;
  if (functions?.[table]?.[action]) {
    await schedule.cancelJob(id);
    await schedule.scheduleJob(id, date, async () => {
      await functions?.[table]?.[action]({ id, linkId, userId }, environement);
      await schedule.cancelJob(id);
    });
  }
};

module.exports = {
  addAlert,
};
