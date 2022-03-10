module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "image",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      largeUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mediumUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      smallUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thumbnailHdUrl: {
        type: Sequelize.TEXT,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.room);
  };

  return Index;
};
