module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "shop",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      shopId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.hasMany(models.room, { onDelete: "cascade" });
    Index.hasMany(models.group, { onDelete: "cascade" });
    Index.hasMany(models.option, { onDelete: "cascade" });
    Index.hasMany(models.alert, { onDelete: "cascade" });
  };

  return Index;
};
