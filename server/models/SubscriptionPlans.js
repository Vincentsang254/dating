const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SubscriptionPlans = sequelize.define(
    "SubscriptionPlans",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tier: {
        type: DataTypes.ENUM("free", "premium", "vip"),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      billingCycle: {
        type: DataTypes.ENUM("monthly", "annual"),
        allowNull: false,
        defaultValue: "monthly",
      },
      features: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: "JSON object with feature flags",
      },
      maxMatches: {
        type: DataTypes.INTEGER,
        defaultValue: -1,
        comment: "-1 means unlimited",
      },
      maxLikes: {
        type: DataTypes.INTEGER,
        defaultValue: -1,
        comment: "-1 means unlimited",
      },
      voiceMessages: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      videoCalls: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      voiceCalls: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      screenShare: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    }
  );

  return SubscriptionPlans;
};
