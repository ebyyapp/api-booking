module.exports = {
  apis: {
    connect: {
      url: process.env.URL_CONNECT,
      fixe: process.env.FIXE_CONNECT,
    },
    main: {
      url: process.env.URL_MAIN,
      fixe: process.env.FIXE_MAIN,
    },
  },
  days: {
    0: {
      fr: "Dimanche",
      en: "Sunday",
    },
    1: {
      fr: "Lundi",
      en: "Monday",
    },
    2: {
      fr: "Mardi",
      en: "Tuesday",
    },
    3: {
      fr: "Mercredi",
      en: "Wednesday",
    },
    4: {
      fr: "Jeudi",
      en: "Thursday",
    },
    5: {
      fr: "Vendredi",
      en: "Friday",
    },
    6: {
      fr: "Samedi",
      en: "Saturday",
    },
  },
};
