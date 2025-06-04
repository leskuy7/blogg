'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // BlogCategories tablosuna timestamps ekle
    try {
      await queryInterface.addColumn('BlogCategories', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    } catch (err) {
      console.log('createdAt column already exists in BlogCategories table');
    }
    
    try {
      await queryInterface.addColumn('BlogCategories', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });
    } catch (err) {
      console.log('updatedAt column already exists in BlogCategories table');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('BlogCategories', 'createdAt');
    await queryInterface.removeColumn('BlogCategories', 'updatedAt');
  }
};
