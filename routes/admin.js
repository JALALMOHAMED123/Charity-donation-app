const express=require('express');
const router=express.Router();
const User=require('../models/user');
const Charity=require('../models/charity');
const userAuth=require('../middleware/auth');

router.post('/approve/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        await Charity.update({approval: true}, {where: { id: req.params}});
        res.json({message: 'Charity Approved by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.post('/reject/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        await Charity.update({approval: false}, {where: { id: req.params}});
        res.json({message: 'Charity rejected by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.delete('/delete/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        await Charity.destroy({where: { id: req.params}});
        res.json({message: 'Charity deleted by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.delete('/delete/:userId', userAuth.authenticate, async(req,res)=>{
    try{
        await Charity.destroy({where: { id: req.params}});
        res.json({message: 'user deleted by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});

router.post('/reject/:charityId', userAuth.authenticate, async(req,res)=>{
    try{
        await Charity.update({approval: false}, {where: { id: req.params}});
        res.json({message: 'Charity rejected by Admin'});
    } catch(err){
        res.status(500).json({ err: err.message});
    }
});