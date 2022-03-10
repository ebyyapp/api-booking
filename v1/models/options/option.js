module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "option",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
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
    Index.belongsTo(models.shop);
    Index.belongsToMany(models.group, {
      through: "condition",
      primaryKey: true,
    });
  };

  return Index;
};
