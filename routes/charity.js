const express=require('express');
const router=express.Router();
const Charity=require('../models/charity');
const userAuth=require('../middleware/auth');
const User=require('../models/user');
const Donation=require('../models/donation');
const Impact_report=require('../models/impact_report');
const Charity_Update=require('../models/charity_update');
const {Op}=require('sequelize');
const Sib = require('sib-api-v3-sdk');
const dotenv=require('dotenv');
dotenv.config();

router.get('/', userAuth.authenticate, async(req,res)=>{
    try{
        const charities=await Charity.findAll();
        res.json({charities});
    } catch(err){
        res.status(404).json({error: err.message});
    }
});

router.get('/:id', userAuth.authenticate, async(req,res)=>{
    try{
        const {id}=req.params;
        const charity=await Charity.findByPk(id);
        res.json({charity});
    } catch(err){
        res.status(404).json({error: err.message});
    }
});


router.post('/create', userAuth.authenticate, async(req,res)=>{
    try{
        const {name, mission, projects, goals, location, category}=req.body;
        await Charity.create({name, mission, projects, goals, location, category});
        res.json({message: "Charity created successfully waiting for Admin approval"});
    } catch(err) {
        res.status(404).json({error: err.message});
    }
});

//search charity
router.post('/search/', userAuth.authenticate, async(req,res)=>{
    const { searchInput, location, category }=req.body;

    const condition={};
    if(location)    condition.location={ [Op.like]: `%${location}%` }
    if(category)    condition.category={ [Op.like]: `%${category}%` }
    if(searchInput)    condition.name={ [Op.like]: `%${searchInput}%` }
    try{
        const charities=await Charity.findAll({
            where: {   [Op.and]: condition  }
        });
        res.json({charities});
    } catch(err){
        res.status(404).json({error: err.message});
    }
});


router.post('/update/:id', userAuth.authenticate, async(req,res)=>{
    try{
        const {name, mission, projects, goals}=req.body;
        await Charity.update({name, mission, projects, goals}, {where: {id: req.params.id}});
        res.json({message: "Charity updated successfully"});
    } catch(err) {
        res.status(404).json({error: err.message});
    }
});

router.post('/charity_update/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        const {name}=req.body;
        await Charity_Update.create({name, CharityId: req.params.charityId});
        res.json({message: "Charity update created successfully"});
    } catch(err) {
        res.status(404).json({error: err.message});
    }
});

router.post('/impact_report/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        const {name}=req.body;
        await Impact_report.create({name, CharityId: req.params.charityId});
        res.json({message: "Charity Impact report created successfully"});
    } catch(err) {
        res.status(404).json({error: err.message});
    }
});

const sendCharityNotification=async(model_name, text)=>{
    try{
        const oneDayAgo=new Date();
        oneDayAgo.setDate(oneDayAgo.getDate()-1);

        const notifications=await model_name.findAll({
            where: { createdAt: { [Op.lt]: oneDayAgo } },
            include: [{
             model: Charity,
                include: [{
                    model: Donation,
                    attributes: ['UserId'],
                    distinct: true  
                }]
            }]
        });
        const emailData=notifications.map(update=>({
            charityName: update.Charity.name,
            updateName: update.name,
            userIds: update.Charity.Donations.map(donation => donation.UserId)
        }))

        const allUserIds = [...new Set(emailData.flatMap(data => data.userIds))];

        const users = await User.findAll({
            where: { id: allUserIds },
            attributes: ['id', 'email', 'name'], 
        });

        const emailsToSend = users.map(user => {
            const userUpdates = emailData.filter(data => data.userIds.includes(user.id));

            return {
                email: user.email,
                name: user.name,
                notifications: userUpdates.map(update => ({
                    charityName: update.charityName,
                    updateName: update.updateName,
                }))
            };
        });
        
        const sender = {
            email: process.env.SENDER_EMAIL,
            name: 'Charity Organization',
        };

        for (const email of emailsToSend) {
            const htmlContent=`
                    <p>Dear ${email.name},</p>
                    <p>Here are the latest ${text} from the charities you've supported:</p>
                    <ul>
                        ${email.notifications.map(
                            update => `<li><strong>${update.charityName}:</strong> ${update.updateName}</li>`
                        ).join('')}
                    </ul>
                    <p>Thank you for your continued support!</p>
                `;
                await sendEmail({ sender, to: [{ email: email.email, name: email.name }], subject: `Charity ${text}`, htmlContent });
        }
        console.log('Emails sent successfully!');
    } catch (err) {
        console.error(err);
        throw new Error('Error sending charity updates');
    }
}

router.use('/updatesMail', userAuth.authenticate, async (req, res) => {
    try {
        await sendCharityNotification(Charity_Update, 'updates');
        
        res.status(200).json({ message: 'Emails sent successfully!' });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

router.use('/impact_reportMail', userAuth.authenticate, async (req, res) => {
    try {
        await sendCharityNotification(Impact_report, 'impact report');
        
        res.status(200).json({ message: 'Emails sent successfully!' });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

const transactionalEmailApi=(()=>{
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;
        console.log(process.env.API_KEY);
        return new Sib.TransactionalEmailsApi();
        // const transactionalEmailApi = new Sib.TransactionalEmailsApi();
})();

const sendEmail = async ({ sender, to, subject, htmlContent, textContent }) => {
    try {
        await transactionalEmailApi.sendTransacEmail({
            sender,
            to,
            subject,
            htmlContent,
            textContent,
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Failed to send email');
    }
};

router.use('/confirmationMail', userAuth.authenticate, async (req, res) => {
    try {
        const { email, amount } =req.body;
        const user = await User.findOne({ where: { email } });
        if(!user) return res.status(401).json({message: 'user email not found'});

        const sender = { email: process.env.SENDER_EMAIL, name: 'Charity' };
        const htmlContent = `
            <p>Dear ${user.name},</p>
            <p>Donation amount ${amount} received successfully.</p>
            <p>Thank you for your support! Your contribution boosts our efforts significantly.</p>
        `;
        await sendEmail({ sender, to: [{ email }], subject: 'Confirmation Mail', htmlContent });
        res.status(200).json({ message: 'Mail sent successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

module.exports={ router, sendCharityNotification } ;

