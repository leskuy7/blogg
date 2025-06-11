const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Blog = sequelize.define('Blog', {
        blogId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        altbaslik: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        resim: {
            type: DataTypes.STRING,
            allowNull: true
        },
        anasayfa: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        onay: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userId'
            }
        }
    }, {
        tableName: 'blogs',
        timestamps: true
    });

    Blog.associate = function(models) {
        Blog.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'User'
        });
        
        Blog.belongsToMany(models.Category, {
            through: 'BlogCategories',
            foreignKey: 'blogId',
            otherKey: 'categoryId',
            as: 'Categories'
        });
    };

    return Blog;
};
