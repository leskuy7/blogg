'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Blog tablosuna createdAt ve updatedAt kolonlarını ekle
    await queryInterface.addColumn('blogs', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    
    await queryInterface.addColumn('blogs', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    });
  },

  async down (queryInterface, Sequelize) {
    // Geri alma işlemi
    await queryInterface.removeColumn('blogs', 'createdAt');
    await queryInterface.removeColumn('blogs', 'updatedAt');
  }
};
