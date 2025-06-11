'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Categories tablosuna timestamps ekle
    try {
      await queryInterface.addColumn('categories', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    } catch (err) {
      console.log('createdAt column already exists in categories table');
    }
    
    try {
      await queryInterface.addColumn('categories', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });
    } catch (err) {
      console.log('updatedAt column already exists in categories table');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'createdAt');
    await queryInterface.removeColumn('categories', 'updatedAt');
  }
};
