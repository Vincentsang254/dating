const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Payments = sequelize.define(
    "Payments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      reference: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      orderId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      paymentId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      transactionId: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },

      provider: {
        type: DataTypes.ENUM(
          "Flutterwave",
          "NOWPayments"
        ),
        allowNull: false,
      },

      paymentType: {
        type: DataTypes.ENUM(
          "Property",
          "Subscription",
          "ContactAccess",
          "Other"
        ),
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "USD",
      },

      priceCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      payCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      payAmount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
      },

      payAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      paymentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      network: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "waiting",
          "confirming",
          "confirmed",
          "sending",
          "finished",
          "failed",
          "expired",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      metadata: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "Payments",
      timestamps: true,
      paranoid: true,

      indexes: [
        {
          fields: ["reference"],
        },
        {
          fields: ["paymentId"],
        },
        {
          fields: ["transactionId"],
        },
        {
          fields: ["orderId"],
        },
        {
          fields: ["provider"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["userId"],
        },
      ],
    }
  );

  Payments.associate = (models) => {
    Payments.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Payments;
};
