'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'emailVerificationExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'emailVerified');
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'emailVerificationExpires');
  }
};
