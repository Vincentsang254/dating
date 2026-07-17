const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Subscriptions = sequelize.define(
    "Subscriptions",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      paymentId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Payments",
          key: "id",
        },
      },
      tier: {
        type: DataTypes.ENUM("free", "premium", "vip"),
        allowNull: false,
        defaultValue: "free",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "cancelled", "expired"),
        allowNull: false,
        defaultValue: "active",
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      autoRenew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "tier"],
        },
      ],
    }
  );

  Subscriptions.associate = (models) => {
    Subscriptions.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
    });
    Subscriptions.belongsTo(models.Payments, {
      foreignKey: "paymentId",
      as: "payment",
    });
  };

  return Subscriptions;
};
