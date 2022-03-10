module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "condition",
    {
      /* id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      }, */
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      multiple: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      max: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {};

  return Index;
};
