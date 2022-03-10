module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "category",
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
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      parrent: {
        type: Sequelize.CHAR,
      },
      order: {
        type: Sequelize.INTEGER,
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
    Index.belongsToMany(models.room, {
      through: "roomCategories",
    });
  };

  return Index;
};
