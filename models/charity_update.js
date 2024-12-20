const sequelize=require('../util/db');
const DataType=require('sequelize');

const Charity_update=sequelize.define('Charity_update',{
    name: {
        type: DataType.STRING,
        allowNull: false
    }  
});

module.exports=Charity_update;
