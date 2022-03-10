module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "alert",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      table: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      linkId: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      action: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      status: {
        type: Sequelize.CHAR,
        defaultValue: "waiting",
      },
      userId: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.shop);
  };

  return Index;
};
