module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "cancelReason",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      fr: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      en: {
        type: Sequelize.TEXT,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {};

  return Index;
};
