module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "group",
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
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      min: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      multiple: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    Index.belongsToMany(models.option, {
      through: "condition",
    });
    Index.belongsToMany(models.room, {
      through: "roomOptions",
    });
  };

  return Index;
};
