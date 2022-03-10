module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "availablity",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      dayId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
      },
      seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.room);
    Index.hasMany(models.time, { onDelete: "cascade" });
  };

  return Index;
};
