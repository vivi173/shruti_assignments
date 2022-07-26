const express = require('express');
const route = express.Router();
const controller = require('../controller/controller');
const {auth,authRole} = require('../middleware/auth');

// const Alien = require('../model/alien');
const  Order = require('../model/order');
const Item = require('../model/item');
const Register = require('../model/registers.js');
const bcrypt =require("bcryptjs");
const jwt =require("jsonwebtoken");
const cookieParser =require("cookie-parser");
const chkqty1= require('../controller/controller');
const {index,del_multi_items,update_multiitems,save_multiitems,save_single_item}= require('../controller/items_controller');
const {new_register,login_check}= require('../controller/register_controller');
const {calc_finalanswer,singlecust_details,saveorder_simple,orderSummary_of_1,save_invoice_withgst,show_invoice_oforder}= require('../controller/orders_controller');





//implement pagination
route.get('/api/item_paginate',index);

route.post('/register',new_register);
route.post('/login',login_check);




route.get("/api/finalanswer",auth,calc_finalanswer);
route.post('/single_customer_details',singlecust_details);


route.post('/delete_multi_items',del_multi_items);
route.post('/update_multi_items',  update_multiitems);
route.post('/save_multi_items',auth,authRole("ADMIN"),save_multiitems);










route.post('/saveinvoice',auth,save_invoice_withgst);





route.get('/checkqty',chkqty1);
// route.get('/checkqty',auth,async(req,res)=>{

//   try{
//       const or1 =await Order.find()
//       res.json(or1)
//   }catch(err){
//       res.send('Error '+err)
//   }
// })


route.post('/saveorder',saveorder_simple);



route.post('/saveitem',save_single_item);



route.get("/show_invoice_oforder",auth,authRole("ADMIN"),show_invoice_oforder)


route.get("/orderSummary_of_1",auth,authRole("ADMIN"), orderSummary_of_1);





/////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////////////////////////////////////////////////








route.post('/registerold',async(req,res)=>{
  const newRegister = new Register(req.body);
  try{
const password =req.body.password;
const confirmpassword =req.body.confirmpassword;
if(password=== confirmpassword)
{
  const registerUser =new Register({
    firstname :req.body.firstname,
    lastname :req.body.lastname,
    email :req.body.email,
    password :req.body.password,
    confirmpassword :req.body.confirmpassword
  })
  const registered= await newRegister.save()
  res.json(registered)
}else{
  res.send("password and confirm password are not same")
}


     
  }catch(err){
      res.send('Error '+err)
  }
})





route.get("/orderSummaryof1/:id", async (req, res) => {
  try {
    let totalPrice = 0;
    const orders = await Order.findById(req.params.id);
    var itemid,itemqty,itemDetails,product,sanitizedItemPrice,sanitizedItemQty;
    
    for (const order of orders) {
        const { products = [] } = order || {};
        for ( product of products) {

            //const { item_id, item_qty } = product;
            itemid=product.item_id;
            itemqty=product.item_qty;
             itemDetails = await Item.findOne({
                _id: itemid
            });
            console.log("itemDetails="+itemDetails);

             sanitizedItemPrice = Number(itemDetails.price);
             sanitizedItemQty = Number(itemqty);
             console.log("sanitizedItemPrice="+sanitizedItemPrice);
             console.log("sanitizedItemQty="+sanitizedItemQty);          
                totalPrice += (sanitizedItemPrice * sanitizedItemQty);
            
        }
    }
    
    res.status(200).json({
        totalPrice,
        totalNoOfOrders: orders.length
    });
} catch(e) {
    console.log(e)
    console.log('e')
    res.status(200).json(e);
}
});





route.get("/orderSummary_of_all", async (req, res) => {
  try {
      let totalPrice = 0;
      const orders = await Order.find({});
      
      for (const order of orders) {
          const { products = [] } = order || {};
          for (const product of products) {
              const { item_id, item_qty } = product;
              const itemDetails = await Item.findOne({
                  _id: item_id
              });
              const sanitizedItemPrice = Number(itemDetails.price);
              const sanitizedItemQty = Number(item_qty);
              if (sanitizedItemPrice && sanitizedItemQty) {
                  totalPrice += sanitizedItemPrice * sanitizedItemQty;
              }
          }
      }
      
      res.status(200).json({
          totalPrice,
          totalNoOfOrders: orders.length
      });
  } catch(e) {
      console.log(e)
      console.log('e')
      res.status(200).json(e);
  }
});



route.get("/api/orders/find_order", async (req, res) => {
    try {
  const aa =  await  Order.aggregate([
          { $lookup:
            {
              from: 'items',
              localField: 'itemId',
              foreignField: 'id_item',
              as: 'orderdetails'
            }
          },
        ]).toArray(function(err1, res) {
          if (err1) throw err1;
          res.status(200).json(aa);
        //   JSON.stringify(res);
        //   console.log(JSON.stringify(res));
         
        });
        
        res.status(200).json(aa);
    } catch (err) {
      res.status(500).json(err);
    }
      
    });

    
route.get("/api/finalanswer_test", async (req, res) => {
    try {
  const aa = await Order.aggregate([
  
    { $unwind : "$products"} ,
    {
      $group: {
        _id: "$username",
        t1: {
         $sum: "$products.item_price"
        }
      }
    }
      
 ])
//const aa= await Order.find()
  console.log(aa);

  res.status(200).json(aa);

} catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
    
  });

  route.get("/api/finalanswerX", async (req, res) => {
    try {
/* fetch the orders for a specific user -> kamal */ 
const orders = await Order.findAll({
    where: {
        username: "kamal"
    }
});

/* 
for each order placed by kamal, you'll have a productId.
Based on the product Id, you can query the items table.
get the price for a particular product from the items table. 
*/ 

let totalPrice = 0;
for (const order of orders) {
    const { products = [] } = order || {};
    for (const product of products) {
        const { item_id, item_qty } = product;
        const item = await items.findOne({
            where: {
                _id: item_id
            }
        });
        totalPrice += item.price * item_qty;
    }
}
  res.status(200).json(aa);

} catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
    
  });









module.exports = route