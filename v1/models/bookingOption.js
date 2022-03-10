module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "bookingOption",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      optionName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceU: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      priceT: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      optionId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      groupName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      groupId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.booking);
  };

  return Index;
};
