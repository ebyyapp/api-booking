module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "booking",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      description: {
        type: Sequelize.TEXT,
      },
      priceU: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      priceT: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "waiting",
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.time);
    Index.belongsTo(models.room);
    Index.hasMany(models.address, { onDelete: "cascade" });
    Index.hasMany(models.bookingOption, { onDelete: "cascade" });
    Index.hasMany(models.payment, { onDelete: "cascade" });
    Index.hasOne(models.cancelReason, { onDelete: "cascade" });
  };

  return Index;
};
