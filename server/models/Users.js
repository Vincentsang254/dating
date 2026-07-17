const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM("customer", "admin", "vip"),
        allowNull: false,
        defaultValue: "customer",
      },
      profilePic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      interests: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      preferences: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      photos: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Comma-separated image URLs",
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verificationCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      timestamps: true,
      paranoid: true,
    }
  );

  // Password hashing and related auth logic are handled in the auth controller.

  return Users;
};
