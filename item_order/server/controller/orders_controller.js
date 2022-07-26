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


    const calc_finalanswer=async(req, res)=>{
    try {
            const aa = await Order.aggregate([
              {
                $unwind: "$products"
              },
              {
                $lookup: {
                  from: "items",
                  localField: "products.item_id",
                  foreignField: "_id",
                  as: "st1"
                }
              },
              {
                $addFields: {
                  result: {
                    "$arrayElemAt": ["$result", 0]
                  }
                }
              },
              {
                $addFields: {
                  total: {
                    "$multiply": ["$products.item_qty","$products.item_price" ]//"$result.price"
                  }
                }
              },
              {
                $group: {
                  _id: "$username",
                  totalAmount: {
                    "$sum": "$total"
                  },
                  total_quantity: {
                    "$sum": 1
                  },
                  order_ids:{ $addToSet: "$_id" }
                }
              }
   
            ])
            res.status(200).json(aa);
  
    } catch (err) {
    res.status(500).json(err);
    console.log(err);
    }
    
  };
  const singlecust_details=async(req,res)=>{

    let totalPrice = 0;
    try{
          const  customer =req.body.username;
          
          const orders = await Order.find({username:customer});
  
          var itemid,itemqty,itemDetails,product,sanitizedItemPrice,sanitizedItemQty;
        console.log("details="+orders);
  
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
      })
    }catch(e) {
      console.log(e)
      console.log('e')
      res.status(200).json(e);
  }
  };
  const saveorder_simple= async(req,res)=>{

    const newOrder = new Order(req.body);
    try{
        const a1= await newOrder.save()
        res.json(a1)
    }catch(err){
        res.send('Error '+err)
    }
  };
const orderSummary_of_1= async (req, res) => {

    try {
        let totalPrice = 0;
        const orders = await Order.find({
            username: 'jai'
        });
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
  };


  
const save_invoice_withgst=async(req,res)=>{

    const newOrder = new Order(req.body);
    try {
          let totalPrice = 0;
          const packingcharge = 50;
          let gst_amt = 0;
          let grand_total = 0; 
          var itemid,itemqty,itemDetails,product,sanitizedItemPrice,sanitizedItemQty;
      
    
          const { products = [] } = newOrder || {};
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
              console.log("totalPrice="+totalPrice);
              
          }
          gst_amt=(totalPrice*15)/100;
          grand_total=totalPrice+gst_amt+packingcharge;
          console.log("grand_total="+grand_total);
  
          const add_invoice =new Order({
  
            userId1 :req.body.userId1,
            username :req.body.username,
            products :req.body.products,
            total_price :totalPrice,
            total_quantity :products.length,
            gst_amt :gst_amt,
            packing_charge :packingcharge,
            grand_total :grand_total
  
  
      })
  
      const registered= await add_invoice.save();
      res.json(registered)
  
  } catch(e) {
      console.log(e)
      console.log('e')
      res.status(200).json(e);
  }
  
  };
  
const show_invoice_oforder=async (req, res) => {

    try {
            const aa = await Order.aggregate([
              {
                $unwind: "$products"
              },
              {
                $lookup: {
                  from: "items",
                  localField: "products.item_id",
                  foreignField: "_id",
                  as: "st1"
                }
              },
           
              {
                $addFields: {
                  total: {
                    "$multiply": ["$products.item_qty","$products.item_price" ]//"$result.price"
                  }
                }
              },
              {
                $group: {
                  _id: "$_id",
                  tot_p: {
                    "$sum": "$total"
                  },
                  total_quantity: {
                    "$sum": 1
                  }
                }
              },
              
           
              {
                $addFields: {
                  
                    tot_price:{ $toDouble :"$tot_p"}
                  }
                
              },
              {
                $project: { 
                _id: 1, tot_price: 1,total_quantity:1,
              "result_gst" : { "$multiply" : [15, { "$divide" : ["$tot_price",100] } ] } }
              },
              {$addFields:{
                packing_charge:50,
              grand_total: {
                      "$sum": ["$result_gst",50,"$tot_price"]
                    }
              }
              }
       
            ])
            res.status(200).json(aa);
  
    } catch (err) {
    res.status(500).json(err);
    console.log(err);
    }
    
  };

  
  module.exports = {calc_finalanswer,singlecust_details,saveorder_simple,orderSummary_of_1,save_invoice_withgst,show_invoice_oforder};
  