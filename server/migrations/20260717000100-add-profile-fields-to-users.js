"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "bio", { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Users", "interests", { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Users", "preferences", { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Users", "photos", { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn("Users", "gender", { type: Sequelize.ENUM("male", "female", "other"), allowNull: true });
    await queryInterface.addColumn("Users", "age", { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn("Users", "location", { type: Sequelize.STRING(150), allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "bio");
    await queryInterface.removeColumn("Users", "interests");
    await queryInterface.removeColumn("Users", "preferences");
    await queryInterface.removeColumn("Users", "photos");
    await queryInterface.removeColumn("Users", "gender");
    await queryInterface.removeColumn("Users", "age");
    await queryInterface.removeColumn("Users", "location");
  },
};
