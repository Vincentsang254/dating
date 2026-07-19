const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BlockedUsers = sequelize.define(
    "BlockedUsers",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      blockerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      blockedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "BlockedUsers",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ["blockerId", "blockedUserId"],
          name: "unique_block_per_user",
        },
        { fields: ["blockerId"] },
        { fields: ["blockedUserId"] },
      ],
    }
  );

  BlockedUsers.associate = (models) => {
    BlockedUsers.belongsTo(models.Users, {
      foreignKey: "blockerId",
      as: "blocker",
      targetKey: "id",
    });
    BlockedUsers.belongsTo(models.Users, {
      foreignKey: "blockedUserId",
      as: "blockedUser",
      targetKey: "id",
    });
  };

  return BlockedUsers;
};