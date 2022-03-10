const { ObjectOf, PropTypes } = require("./test2");

const data = {
  times: [
    {
      start: "08:00",
      end: "09:00",
    },
    {
      start: "9:00",
      end: "10:00",
    },
  ],
};
const moment = require("moment");
const today = moment().startOf("day").format("YYYY-MM-DD");

const rule = {
  times: {
    required: true,
    type: "array",
    format: {
      start: {
        required: true,
        type: "string",
      },
      end: {
        required: true,
        type: "string",
      },
      seats: {
        required: true,
        type: "number",
      },
    },
  },
}; 

const test = async () => {
  const result = await ObjectOf(data, rule);
  console.log(result);
};
test();
