const express= require('express');
const router= express.Router();
const Alien =require('../models/alien')

router.get('/',async(req,res)=>{
    // console.log('Get request')
    //res.send('Get Request')
    try{
        const aliens =await Alien.find()
        res.json(aliens)
    }catch(err){
        res.send('Error '+err)
    }
})

router.get('/:id',async(req,res)=>{
   
    try{
        const alien=await Alien.findById(req.params.id)
        res.json(alien)
    }catch(err){
        res.send('Error '+err)
    }
})

router.post('/',async(req,res)=>{
    // const aliens = new Alien({
const alien= new Alien({
    name: req.body.name,
    phonenumber: req.body.phonenumber,
    email: req.body.email,
    dob: req.body.dob,
    address: req.body.address


    })
        // res.json(aliens)
    try{
        const a1= await alien.save()
        res.json(a1)
    }catch(err){
        res.send('Error '+err)
    }
})

router.patch('/:id',async(req,res)=>{
    try{
        const alien= await Alien.findById(req.params.id)
        alien.name=req.body.name
        alien.phonenumber=req.body.phonenumber
        alien.email=req.body.email
        alien.dob=req.body.dob
        alien.address=req.body.address

        const a1=await alien.save()
        res.json(a1)
    }catch(err){
        res.send(err)
    }
})


router.delete('/:id',async(req,res)=>{
    try{
        const alien= await Alien.findById(req.params.id)
       

        const a1=await alien.remove()
        res.json(a1)
    }catch(err){
        res.send(err)
    }
})

module.exports=router;