const express=require('express');
const router=express.Router();
const Charity=require('../models/charity');
const userAuth=require('../middleware/auth');
const {Op}=require('sequelize');
const Category = require('../models/category');

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
        const {name, mission, projects, goals}=req.body;
        await Charity.create({name, mission, projects, goals});
        res.json({message: "Charity created successfully waiting for Admin approval"});
    } catch(err) {
        res.status(404).json({error: err.message});
    }
});

//search charity
router.get('/search/:searchInput', userAuth.authenticate, async(req,res)=>{
    const searchInput=req.params.searchInput.trim();
    const { location, category }=req.body;

    const condition={};
    const category_condition={};
    if(location)    condition.location={ location: { [Op.like]: `%${location}%` }}
    if(category)    category_condition.category={ name: { [Op.like]: `%${category}%` }}
    if(searchInput)    condition.searchInput={ name: { [Op.like]: `%${searchInput}%` }}
    try{
        const charities=await Charity.findAll({
            where: {
                [Op.and]: condition
            },
            include: [{
                model: Category,
                where: {
                    [Op.and]: category_condition
                },
                required: category? true : false
            }]
        });
        res.status(200).json({charities});
    } catch(err){
        res.status(404).json({error: err});
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



module.exports=router;

