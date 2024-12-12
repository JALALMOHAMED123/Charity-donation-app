const express=require('express');
const router=express.Router();
const userauth=require('../middleware/auth');
const Payment=require('../models/payment');
const User=require('../models/user');

const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');

router.get('/donation', userauth.authenticate, async(req,res)=>{
    try{
        var rzp=new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount=2500;
        rzp.orders.create({amount, currency: "INR"}, (err, order)=>{
            // console.log(err);
            if (err) {
                console.error("Razorpay Error: ", err); 
                return res.status(500).json({ error: "Razorpay order creation failed", details: JSON.stringify(err) });
            }
            req.user.createPayment({ orderid: order.id, status: 'PENDING'}).then(()=>{
                res.status(201).json({order, key_id: rzp.key_id});
            })
            .catch((err=>{
                res.status(401).json({Error: err.message});
            }));
        })
    }
    catch(err){
        res.status(401).json({Error: "purchase controller not working"});
    }
});
router.post('/updateStatus', userauth.authenticate, async (req,res)=>{
    try{
        const {payment_id, order_id} =req.body;
        const payment=await Payment.findOne({where :{orderid: order_id}})
        const p1= payment.update({paymentid: payment_id, status: "SUCCESS"});
        const p2= req.user.update();

        Promise.all([p1,p2]).then(()=>{
            res.status(200).json({message: 'Transaction successfull'});
        })
        .catch((err)=>{
            console.log(err.message);
        });
    }
    catch(err){
        res.status(401).json({Error: err.message});
    }
});

router.get('/donationHistory', userauth.authenticate,async(req, res)=>{
    try{
        const history=await Payment.findAll({where: {userId: req.user.id}});
        res.status(200).json({history});
    }
    catch(err){
        res.status(401).json({ err:err.message});
    }
});

router.get('/downloadReceipt', userauth.authenticate,async (req, res) => {
    try {
        const {id}=req.params
        const receipt=await Payment.findByPk(id);
        res.status(200).json({receipt});

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

router.use('/confirmationMail', userauth.authenticate, async (req, res) => {
    try {
        const { email } = req.User;
        const user = await User.findOne({ where: { email } });
        const id = uuid.v4();

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;
        console.log(process.env.API_KEY);
        const transactionalEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: process.env.NAME,
            name: 'Charity',
        };

        const receivers = [
            {
                email: email,
            },
        ];

        transactionalEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'Confirmation Mail',
                    textContent: `Payment received successfully and we will update the donation status simuntaniously...
                    Thank you for your amount it'll BOOST us to do more`
                })
                .then(() => {
                    return res.status(200).json({ message: 'Mail send successfully' });
                })
                .catch((error) => {
                    return res.status(401).json({ err: error.message });
                });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

module.exports=router;