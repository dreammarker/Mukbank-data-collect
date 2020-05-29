"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("foodcategories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      parent: {
        type: Sequelize.STRING
      },
      firchild: {
        type: Sequelize.STRING
      },
      secondchild: {
        type: Sequelize.STRING
      },
      thirdchild: {
        type: Sequelize.STRING
      },
      fourchild: {
        type: Sequelize.STRING
      },
      longword: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleteAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("foodcategories");
  }
};
