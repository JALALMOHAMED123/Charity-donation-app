const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const sequelize= require('./util/db');
const User=require('./models/user');
const Charity=require('./models/charity');
const Donation=require('./models/donation');
const { router, sendCharityNotification } = require('./routes/charity');
const Charity_Update=require('./models/charity_update');
const Impact_report=require('./models/impact_report');
const cron = require('node-cron');

const app = express();

app.use(cors());
app.options('*',cors());
app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const userRoutes=require('./routes/users');
const donationRoutes=require('./routes/donation');
const adminRoutes=require('./routes/admin');

app.use('/user',userRoutes);
app.use('/charity',router);
app.use(donationRoutes);
app.use('/admin',adminRoutes);

User.hasMany(Donation);
Donation.belongsTo(User);

Charity.hasMany(Donation);
Donation.belongsTo(Charity);

Charity.hasMany(Charity_Update);
Charity_Update.belongsTo(Charity);

Charity.hasMany(Impact_report);
Impact_report.belongsTo(Charity);

cron.schedule('29 22 * * *', async () => {
    console.log("Cron job is running...");
    try {
        await sendCharityNotification(Charity_Update, 'updates');
        await sendCharityNotification(Impact_report, 'impact report');
    } catch (error) {
        console.error("Error during cron job:", error.message);
    }
});

sequelize
        .sync()
        .then(()=>{
            app.listen(process.env.PORT,()=>{
                console.log(`server is running on port ${process.env.PORT}`);
            });
        })
        .catch((err)=>{
            console.log(err.message);
        });

module.exports = { User, Charity, Donation };