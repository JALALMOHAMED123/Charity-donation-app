const sequelize=require('../util/db');
const DataType=require('sequelize');

const Category=sequelize.define('Category',{
    name: {
        type: DataType.STRING,
        allowNull: false
    }
});

module.exports=Category;
