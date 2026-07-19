const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserReports = sequelize.define(
    "UserReports",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("open", "reviewed", "dismissed"),
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      tableName: "UserReports",
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ["reporterId"] },
        { fields: ["reportedUserId"] },
      ],
    }
  );

  UserReports.associate = (models) => {
    UserReports.belongsTo(models.Users, {
      foreignKey: "reporterId",
      as: "reporter",
      targetKey: "id",
    });

    UserReports.belongsTo(models.Users, {
      foreignKey: "reportedUserId",
      as: "reportedUser",
      targetKey: "id",
    });
  };

  return UserReports;
};
