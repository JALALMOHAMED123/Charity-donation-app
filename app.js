const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const sequelize= require('./util/db');
const User=require('./models/user');
const Charity=require('./models/charity');
const Category=require('./models/category');
const Charity_Category=require('./models/charity_category');
const Payment=require('./models/payment');
const cron = require('node-cron');

const app = express();

app.use(cors());
app.options('*',cors());
app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const userRoutes=require('./routes/users');
const charityRoutes=require('./routes/charity');
const adminRoutes=require('./routes/charity');


app.use('/user',userRoutes);
app.use('/charity',charityRoutes);
app.use('/charity',charityRoutes);

Charity.belongsToMany(Category, { through: Charity_Category })
Category.belongsToMany(Charity, { through: Charity_Category })

User.hasMany(Payment);
Payment.belongsTo(User);

cron.schedule('0 9 * * *', async () => {
    const donors = await getDonorsWithPendingDonations(); 
    for (const donor of donors) {
        await sendEmail(
            donor.email,
            'Reminder: Complete Your Donation',
            `<p>Dear ${donor.name},</p><p>Please complete your donation.</p>`
        );
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