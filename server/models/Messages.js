const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Messages = sequelize.define(
    "Messages",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conversations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      messageType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "text",
      },
      mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mediaType: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Messages",
      timestamps: true,
      paranoid: false,
    }
  );

  Messages.associate = (models) => {
    Messages.belongsTo(models.Conversations, {
      foreignKey: "conversationId",
      as: "conversation",
      targetKey: "id",
    });
    Messages.belongsTo(models.Users, {
      foreignKey: "senderId",
      as: "sender",
      targetKey: "id",
    });
    Messages.belongsTo(models.Users, {
      foreignKey: "recipientId",
      as: "recipient",
      targetKey: "id",
    });
  };

  return Messages;
};
