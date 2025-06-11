const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        categoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'categories',
        timestamps: true
    });

    Category.associate = function(models) {
        Category.belongsToMany(models.Blog, {
            through: 'BlogCategories',
            foreignKey: 'categoryId',
            otherKey: 'blogId',
            as: 'Blogs'
        });
    };

    return Category;
};
