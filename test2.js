const moment = require("moment");
const CheckType = (item, type) => {
  const isArray = Array.isArray(item);
  if (type === "date") {
    const isDate = moment(item).isValid();
    if (isDate) {
      return true;
    } else {
      return false;
    }
  }

  if (typeof item === type || (isArray && type === "array")) return true;
  else return false;
};

const ObjectOf = (object, rules, cal) => {
  const errors = [];
  Object.entries(rules).forEach(([key, value]) => {
    const { required, type, format, values, gte, lte, gt, lt } = value;
    const field = object[key];
    if (required) {
      const hasOwn = object.hasOwnProperty(key);
      if (!hasOwn) {
        errors.push({ [key]: "Is required" });
        return;
      }
    }
    if (field) {
      if (type) {
        const check = CheckType(field, type);
        if (!check) {
          errors.push({ [key]: `Incorrect type: expected ${type}` });
          return;
        }
      }
      if (gte) {
        if (field < gte)
          errors.push({
            [key]: `Incorrect value : expected greater or equal ${gte}`,
          });
      }
      if (lte) {
        if (field > lte)
          errors.push({
            [key]: `Incorrect value : expected inferior or equal ${lte}`,
          });
      }
      if (gt) {
        if (field <= gt)
          errors.push({
            [key]: `Incorrect value : expected greater ${gt}`,
          });
      }
      if (lt) {
        if (field >= lt)
          errors.push({
            [key]: `Incorrect value : expected inferior ${lt}`,
          });
      }

      if (
        values &&
        Array.isArray(values) &&
        values.length &&
        typeof field !== "object"
      ) {
        if (!values.includes(field)) {
          errors.push({
            [key]: `Incorrect value: expected ${JSON.stringify(values)}`,
          });
          return;
        }
      }
      if (format) {
        if (type && type === "object") {
          const test = ObjectOf(field, format);
          if (!test.correct) {
            errors.push({ [key]: test });
          }
        }

        if (type && type === "array") {
          const errorsArray = [];
          field.forEach((item, index) => {
            const test = ObjectOf(item, format);
            if (!test.correct) {
              errorsArray.push({ [`${key}_${index + 1}`]: test });
            }
          });

          if (errorsArray.length) {
            const data = {};
            errorsArray.forEach((element) => {
              Object.entries(element).forEach(([key, value]) => {
                Object.assign(data, { [key]: value });
              });
            });
            errors.push({ [key]: data });
          }
        }
      }
    }
  });
  if (callback) {
    const toReturn = errors.length ? errors : undefined;
    callback(toReturn);
  } else {
    if (errors.length) {
      return { status: 400, correct: false, data: errors };
    } else {
      return { status: 200, correct: true };
    }
  }
};

const PropTypes = () => {
  const functions = {
    isRequired() {
      Object.assign(this, { required: true });
      return this;
    },
    isString() {
      Object.assign(this, {
        type: "string",
      });
      return this;
    },
    isNumber() {
      Object.assign(this, { type: "number" });
      return this;
    },
    isDate() {
      Object.assign(this, { type: "date" });
      return this;
    },
    isBoolean() {
      Object.assign(this, { type: "boolean" });
      return this;
    },
    oneOf(values) {
      Object.assign(this, { values });
      return this;
    },
    isObject() {
      Object.assign(this, { type: "object" });
      return this;
    },
    isObjectOf(object) {
      Object.assign(this, { type: "object", format: object });
      return this;
    },
    isArray() {
      Object.assign(this, { type: "array" });
      return this;
    },
    isArrayOf(object) {
      Object.assign(this, { type: "array", format: object });
      return this;
    },
    isGte(value) {
      Object.assign(this, { gte: value });
      return this;
    },
    isLte(value) {
      Object.assign(this, { lte: value });
      return this;
    },
    isGt(value) {
      Object.assign(this, { gt: value });
      return this;
    },
    isLt(value) {
      Object.assign(this, { lt: value });
      return this;
    },
  };

  Object.defineProperties(functions, {
    isRequired: {
      writable: false,
      enumerable: false,
    },
    isString: {
      writable: false,
      enumerable: false,
    },
    isNumber: {
      writable: false,
      enumerable: false,
    },
    isDate: {
      writable: false,
      enumerable: false,
    },
    isBoolean: {
      writable: false,
      enumerable: false,
    },
    isObject: {
      writable: false,
      enumerable: false,
    },
    isObjectOf: {
      writable: false,
      enumerable: false,
    },
    isArray: {
      writable: false,
      enumerable: false,
    },
    isArrayOf: {
      writable: false,
      enumerable: false,
    },
    oneOf: {
      writable: false,
      enumerable: false,
    },
    isGte: {
      writable: false,
      enumerable: false,
    },
    isLte: {
      writable: false,
      enumerable: false,
    },
    isGt: {
      writable: false,
      enumerable: false,
    },
    isLt: {
      writable: false,
      enumerable: false,
    },
  });
  return functions;
};

module.exports = {
  CheckType,
  ObjectOf,
  PropTypes,
};
