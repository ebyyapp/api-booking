module.exports = (sequelize, Sequelize) => {
    const Index = sequelize.define(
      "attribute",
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
        value: {
          type: Sequelize.STRING,
          allowNull: false,
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
  