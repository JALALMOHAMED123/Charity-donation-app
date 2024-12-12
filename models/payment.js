const Datatype=require('sequelize');
const sequelize=require('../util/db');

const Payment=sequelize.define('Payment', {
    id: {
        type: Datatype.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    paymentid: Datatype.STRING,
    orderid: Datatype.STRING,
    status: Datatype.STRING,
    amount: Datatype.INTEGER
})

module.exports=Payment;