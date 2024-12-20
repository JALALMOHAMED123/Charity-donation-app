const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../models/user');
const userAuth=require('../middleware/auth');
function webtoken(id){
    return jwt.sign({ userId: id}, process.env.TOKEN_SECRET);
}

router.post('/signup',async(req,res)=>{
    try{
        const {name, email, password}=req.body;
        console.log(name);
        const userexist=await User.findOne({ where: {email}});

        if(userexist){
            return res.status(400).json({error: "User already exists, Please Login"});
        }
        else
        {
            const saltrounds=10;
            bcrypt.hash(password, saltrounds, async(err, hash)=>{
                console.log(err);
                await User.create({name, email, password: hash});
                res.status(201).json({ message: "User signed up successfuly"});
            }) 
        }
    } catch(err){
        res.status(500).json({error: err.message}); 
    };
});



router.post('/login',async(req,res)=>{
    try{
        const {email, password}=req.body;
        const user=await User.findAll({ where: {email}});
        if(user){
            bcrypt.compare(password, user[0].password, (err,result)=>{
                if(err){
                    throw new Error("something went wrong");
                }
                if(result==true) {
                    return res.json({message: "Login successfully", token: webtoken(user[0].id)});
                }
                else{
                    res.status(401).json({error: "User not authorized"});
                }
            });
        }
    }
    catch(err){
        res.status(404).json({error: "User not found"});
    }
});

router.post('/update/:id', userAuth.authenticate, async(req,res)=>{
    try{
        const {name, email, password}=req.body;
        if(password)   {
            const saltrounds=10;
            bcrypt.hash(password, saltrounds, async(err, hash)=>{
                console.log(err);
                await User.update({name, email, password: hash}, {where: {id: req.params.id}});
            })
        } else{
            await User.update({name, email}, {where: {id: req.params.id}});
        }
        res.status(200).json({message: "User updated successfully"});
    } catch(err){
        res.status(404).json({error: err.message})
    }
});

router.get('/', userAuth.authenticate, async(req,res)=>{
    try{
        const users=await User.findAll();
        res.status(200).json({users});
    } catch(err){
        res.status(404).json({error: err.message})
    }
});

router.get('/:id', userAuth.authenticate, async(req,res)=>{
    try{
        const user=await User.findOne({where: {id: req.params.id}});
        res.status(200).json({user});
    } catch(err){
        res.status(404).json({error: err.message})
    }
});

module.exports=router;

