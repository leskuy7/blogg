const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Session = sequelize.define('Session', {
        sid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'Sessions',
        timestamps: true
    });

    return Session;
};
