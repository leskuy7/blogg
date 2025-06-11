const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },        rolename: {
            type: DataTypes.ENUM('user', 'moderator', 'admin'),
            defaultValue: 'user'        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        emailVerificationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emailVerificationExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    User.associate = function(models) {
        User.hasMany(models.Blog, {
            foreignKey: 'userId',
            as: 'Blogs'
        });
    };

    return User;
};
