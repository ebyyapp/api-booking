module.exports = (sequelize, Sequelize) => {
  const Index = sequelize.define(
    "room",
    {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
      },
      modelId: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      needPayment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.CHAR,
        defaultValue: "waiting",
      },
      color: {
        type: Sequelize.CHAR,
      },
      acceptance: {
        type: Sequelize.CHAR,
        allowNull: false,
        defaultValue: "manual",
      },
      private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      delivery: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deferredValue: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reminderH: {
        type: Sequelize.INTEGER,
        defaultValue: 48,
      },
      cancelIfAfter: {
        type: Sequelize.INTEGER,
        defaultValue: 24,
      },
      min: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      minDays: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      startTime: {
        type: Sequelize.TIME,
        defaultValue: "10:00:00",
      },
      minDeposit: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      underscored: false,
    }
  );
  Index.associate = (models) => {
    Index.belongsTo(models.shop);
    Index.hasMany(models.availablity, { onDelete: "cascade" });
    Index.hasMany(models.feature, { onDelete: "cascade" });
    Index.hasMany(models.attribute, { onDelete: "cascade" });
    Index.hasMany(models.booking, { onDelete: "cascade" });
    Index.hasMany(models.image, { onDelete: "cascade" });
    Index.belongsToMany(models.group, {
      through: "roomOptions",
    });
    Index.belongsToMany(models.category, {
      through: "roomCategories",
    });
  };

  return Index;
};
