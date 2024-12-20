const sequelize=require('../util/db');
const DataType=require('sequelize');

const User=sequelize.define('User',{
    id:{
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataType.STRING,
        allowNull: false
    },
    email: {
        type: DataType.STRING,
        allowNull: false
    },
    password: {
        type: DataType.STRING,
        allowNull: false
    },
    isAdmin: {
        type: DataType.BOOLEAN,
        defaultValue: false
    }  
});

module.exports=User;
