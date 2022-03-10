const { PropTypes } = require("../../propstypes");
const moment = require("moment");
const today = moment().format("YYYY-MM-DD");
module.exports = {
  newRoom: {
    name: PropTypes().isRequired().isString(),
    description: PropTypes().isRequired().isString(),
    type: PropTypes()
      .isRequired()
      .isString()
      .oneOf(["INTERVAL", "DAY", "MULTIDAYS"]),
    needPayment: PropTypes().isRequired().isBoolean(),
    price: PropTypes().isNumber(),
    color: PropTypes().isString(),
    acceptance: PropTypes().isString(),
    private: PropTypes().isBoolean(),
    delivery: PropTypes().isBoolean(),
    deferredValue: PropTypes().isNumber(),
    confirm: PropTypes().isNumber(),
    shopId: PropTypes().isRequired().isString(),
  },
  availablity: {
    roomId: PropTypes().isRequired().isString(),
    dayId: PropTypes().isNumber().oneOf([0, 1, 2, 3, 4, 5, 6]),
    date: PropTypes().isDate().isGte(today),
    seats: PropTypes().isNumber().isGt(0),
    activated: PropTypes().isBoolean(),
  },
  booking: {
    roomId: PropTypes().isRequired().isString(),
    timeId: PropTypes().isString(),
    description: PropTypes().isString(),
    quantity: PropTypes().isRequired().isNumber(),
    startDate: PropTypes().isRequired().isDate().isGte(today),
    endDate: PropTypes().isDate().isGte(today),
    addresses: PropTypes().isRequired().isObjectOf({
      billing: PropTypes().isRequired().isString(),
      delivery: PropTypes().isString(),
    }),
    options: PropTypes().isArrayOf({
      id: PropTypes().isRequired().isString(),
      items: PropTypes().isRequired().isArrayOf({
        id: PropTypes().isRequired().isString(),
        name: PropTypes().isRequired().isString(),
        price: PropTypes().isRequired().isNumber(),
        quantity: PropTypes().isRequired().isNumber(),
      }),
    }),
    payments: PropTypes().isArray(),
  },
  roomGet: {
    filters: PropTypes().isArrayOf({
      key: PropTypes().isRequired().isString(),
      value: PropTypes().isRequired().isString(),
    }),
  },
  newAttributes: {
    attributes: PropTypes().isRequired().isArrayOf({
      name: PropTypes().isString().isRequired(),
      value: PropTypes().isString().isRequired(),
    }),
  },
  deleteAttributes: {
    ids: PropTypes().isRequired().isArray(),
  },
  setRoomCategories: {
    categoryIds: PropTypes().isRequired().isArray(),
    action: PropTypes().isRequired().oneOf(["add", "update", "delete"]),
  },
  newGroup: {
    name: PropTypes().isRequired().isString(),
    message: PropTypes().isRequired().isString(),
    min: PropTypes().isRequired().isNumber(),
    max: PropTypes().isRequired().isNumber(),
    multiple: PropTypes().isRequired().isBoolean(),
  },
  deleteGroups: {
    ids: PropTypes().isRequired().isArray(),
  },
  newOption: {
    name: PropTypes().isRequired().isString(),
  },
  deleteOptions: {
    ids: PropTypes().isRequired().isArray(),
  },
  setConditions: {
    optionIds: PropTypes().isRequired().isArray(),
    price: PropTypes().isRequired().isNumber(),
    multiple: PropTypes().isRequired().isBoolean(),
    max: PropTypes().isRequired().isNumber(),
    action: PropTypes().isRequired().oneOf(["add", "update", "delete"]),
  },
  setRoomOptions: {
    groupIds: PropTypes().isRequired().isArray(),
    action: PropTypes().isRequired().oneOf(["add", "update", "delete"]),
  },
  newImades: {
    images: PropTypes().isRequired().isArrayOf({
      url: PropTypes().isRequired().isString(),
      largeUrl: PropTypes().isString(),
      mediumUrl: PropTypes().isString(),
      smallUrl: PropTypes().isString(),
      thumbnailHdUrl: PropTypes().isString(),
    }),
  },
  deleteImages: {
    ids: PropTypes().isRequired().isArray(),
  },
  newFeatures: {
    features: PropTypes().isRequired().isArrayOf({
      key: PropTypes().isRequired().isString(),
      type: PropTypes().isRequired().isString(),
      value: PropTypes().isRequired().isString(),
    }),
  },
  deleteFeatures: {
    ids: PropTypes().isRequired().isArray(),
  },
};
