const sequelize=require('../util/db');
const DataType=require('sequelize');

const Impact_report=sequelize.define('Impact_report',{
    name: {
        type: DataType.STRING,
        allowNull: false
    }  
});

module.exports=Impact_report;
