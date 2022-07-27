const Order = require('../model/order');
const Item= require('../model/item');
var dbcourse = [];

exports.findid = (req, res)=>{   
    try{
        const databyid= Order.findById(req.params.id)
        res.json(databyid)
    }catch(err){
        res.send('Error '+err)
    }
}





const chkqty1=async(req,res)=>{


    try{
        const or1 =await Order.find()
        res.json(or1)
    }catch(err){
        res.send('Error '+err)
    }
  }

module.exports = chkqty1;