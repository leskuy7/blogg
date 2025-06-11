const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BlogCategories = sequelize.define('BlogCategories', {
        blogId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'blogs',
                key: 'blogId'
            }
        },
        categoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'categories',
                key: 'categoryId'
            }
        }
    }, {
        tableName: 'BlogCategories',
        timestamps: false
    });

    return BlogCategories;
};
