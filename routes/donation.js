const express=require('express');
const router=express.Router();
const userauth=require('../middleware/auth');
const User=require('../models/user');
const Donation=require('../models/donation');
const Razorpay=require('razorpay');

const Sib = require('sib-api-v3-sdk');

router.get('/donation/:charityId', userauth.authenticate, async(req,res)=>{
    try{
        var rzp=new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount=250;
        const order=await rzp.orders.create({amount, currency: "INR"});

        await req.user.createDonation({ orderid: order.id, status: 'PENDING', CharityId: req.params.charityId}).then(()=>{
            res.status(201).json({order, key_id: rzp.key_id});
        })
        .catch((err=>{
            res.status(401).json({Error: err.message});
        }));
        
    }
    catch(err){
        res.status(401).json({Error: err.message});
    }
});
router.post('/updateStatus', userauth.authenticate, async (req,res)=>{
    try{
        const {payment_id, order_id, amount} =req.body;
        const payment=await Donation.findOne({where :{orderid: order_id}})
        await payment.update({paymentid: payment_id,amount, status: "SUCCESS"})
        .then(()=>{
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
        const history=await Donation.findAll({where: {userId: req.user.id}});
        res.status(200).json({history});
    }
    catch(err){
        res.status(401).json({ err:err.message});
    }
});

router.get('/downloadReceipt/:id', userauth.authenticate,async (req, res) => {
    try {
        const {id}=req.params;
        const receipt=await Donation.findByPk(id);
        res.status(200).json({receipt});

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

module.exports=router;