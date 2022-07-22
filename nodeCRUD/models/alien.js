const mongoose= require('mongoose')


const userschema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
 
    phonenumber: 
    { 
        type: Number,      
        required:true 
    },
    email:{
        type:String,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    }

})

module.exports = mongoose.model('Alien',userschema);