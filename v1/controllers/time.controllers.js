const _fTimes = require("../functions/time.functions");

exports.newTimes = async (req, res) => {
  const { availablityId, times } = req.body;
  const { environement } = req;
  if (availablityId) {
    let res_times = [];
    if (times && times.length) {
      const promises = times.map(async (time) => {
        const o = Object.assign(time, {
          availablityId,
        });
        const result = await _fTimes
          .addTime(o, environement)
          .then((result) => {
            return result;
          })
          .catch((err) => {
            return err;
          });

        return result;
      });

      const res_promises = await Promise.all(promises);
      res.send(res_promises);
    }
  } else {
    res.status(400).json({
      err: {
        item: "availablityId",
        value: "Définissez un roomId",
      },
      error: "Bad request",
    });
  }
};
