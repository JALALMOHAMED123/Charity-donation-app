const express=require('express');
const router=express.Router();
const User=require('../models/user');
const Charity=require('../models/charity');
const Donation=require('../models/donation');
const userAuth=require('../middleware/auth');

const isAdmin = require('../middleware/isAdmin');

router.patch('/approve/:charityId', userAuth.authenticate, isAdmin, async(req,res)=>{
    try{
        await Charity.update({approval: true}, {where: { id: req.params.charityId}});
        res.json({message: 'Charity Approved by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.patch('/reject/:charityId', userAuth.authenticate,isAdmin,  async(req,res)=>{
    try{
        await Charity.update({approval: false}, {where: { id: req.params.charityId}});
        res.json({message: 'Charity rejected by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.delete('/delete_charity/:charityId', userAuth.authenticate,isAdmin,  async(req,res)=>{
    try{
        await Charity.destroy({where: { id: req.params.charityId}});
        res.json({message: 'Charity deleted by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.delete('/delete_user/:userId', userAuth.authenticate,isAdmin,  async(req,res)=>{
    try{
        await User.destroy({where: { id: req.params.userId}});
        res.json({message: 'user deleted by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.patch('/makeAdmin/:userId', userAuth.authenticate, isAdmin, async(req,res)=>{
    const id=req.params.userId;
    try{
        const user=await User.findByPk(id, { where: {isAdmin: true}});
        if(user) return res.status(400).json({message: `user already an admin`});
        
        await User.update({isAdmin: true}, {where: { id: req.params.userId}});
        res.json({message: 'Now ${user.name} as admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.post('/create_category', userAuth.authenticate,isAdmin,  async(req,res)=>{
    try{
        await Category.create({name: req.body.name});
        res.json({message: 'category created by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

module.exports=router;