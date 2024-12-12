const sequelize=require('../util/db');
const DataType=require('sequelize');

const Charity_Category=sequelize.define('Charity_Category',{
    name: {
        type: DataType.STRING,
        allowNull: false
    }
});

module.exports=Charity_Category;
