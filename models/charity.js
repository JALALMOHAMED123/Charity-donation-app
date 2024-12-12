const sequelize=require('../util/db');
const DataType=require('sequelize');

const Charity=sequelize.define('Charity',{
    name: {
        type: DataType.STRING,
        allowNull: false
    },
    mission: {
        type: DataType.STRING,
        allowNull: false
    },
    projects: {
        type: DataType.STRING,
        allowNull: false
    },
    goals: {
        type: DataType.STRING,
        allowNull: false
    },
    location: {
        type: DataType.STRING,
        allowNull: false
    },
    approval:{
        type: DataType.BOOLEAN,
        defaultValue: false
    }
});

module.exports=Charity;
