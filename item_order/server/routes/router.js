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
//const controller = require('../controller/controller');




route.get("/api/finalanswer",auth,async (req, res) => {
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
  
});
route.post('/single_customer_details',async(req,res)=>{
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
});




route.post('/register',async(req,res)=>{
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
                      confirmpassword :req.body.confirmpassword,
                      role :req.body.role

                })

                console.log("the success part"+registerUser);
                const token = await registerUser.generateAuthToken();
                console.log("the token part"+token);
                // res.cookie("jwt",token,{
                //     expires:new Date(Date.now()+ 30000),
                //     httpOnly:true
                // });
                // console.log(cookie);

              //   const registered= await newRegister.save().then(result=>{
              //     res.status(200).json({
              //         new_user:result
              //     })
              // });
              const registered= await newRegister.save();
              console.log("the page part"+registered);
                res.status(200).send("registration done")
          
               
              //  res.json(registered)
              //  res.status(201).send("registration done")
          }else{
                  res.send("password and confirm password are not same")
          }     
  }
  catch(err){
  res.status(400).send('Error not registered == '+err)
  }
})
route.post('/login',async(req,res)=>{
try{
  const  inputemail =req.body.email;
  const inputpassword =req.body.password;
  console.log("inputemail="+inputemail);
  const useremail = await Register.findOne({email:inputemail});
  //res.send(useremail);
  console.log("useremail="+useremail);
  console.log(`${email} and  password is ${password}`)
  //if(useremail.password === inputpassword)
  const isMatch = bcrypt.compare(inputpassword,useremail.password);
  const token = await useremail.generateAuthToken();

  // const accessToken = jwt.sign(
  //   {
  //       id: user._id,
  //       isAdmin: user.isAdmin,
  //   },
  //   process.env.JWT_SEC,
  //       {expiresIn:"3d"}
  //   );
  // res.status(200).json({...others, accessToken});
  console.log("the token part = "+token);

  res.cookie("jwt",token,{
    expires:new Date(Date.now()+ 600000),//10min
    httpOnly:true
  });
 // console.log(cookie);
  //console.log(`this is cookie got which was generated during login  ${req.cookies.jwt}         `);
  if(isMatch)
  {
    res.status(201).send("valid login")
  }else{
    res.send("incorrect password");
  }     
}catch(err){
  res.status(400).send('invalid email '+err)
}
})


route.post('/save_multi_items',auth,authRole("ADMIN"),async(req,res)=>{
  const new_multi = new Item(req.body);
  console.log("1="+new_multi);

  const new_multi_items = req.body ;
  console.log("2="+new_multi_items);

  try{
        const result1 = await Item.insertMany(new_multi_items);
        console.log(`${result1.insertedCount} documents were inserted`);     
        res.status(200).send(result1);
  }catch(err){
        res.send('Error inserting '+err)
  }
})

route.post('/saveinvoice',auth,async(req,res)=>{
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

})





route.get('/checkqty',auth,async(req,res)=>{

  try{
      const or1 =await Order.find()
      res.json(or1)
  }catch(err){
      res.send('Error '+err)
  }
})


route.post('/saveorder',async(req,res)=>{
  const newOrder = new Order(req.body);
  try{
      const a1= await newOrder.save()
      res.json(a1)
  }catch(err){
      res.send('Error '+err)
  }
})


route.post('/saveitem',async(req,res)=>{
      const newitem= new Item({
          itemname: req.body.itemname,
          price: req.body.price
      })
      try{
            const a1= await newitem.save()
            res.json(a1)
      }catch(err){
            res.send('Error '+err)
      }
})



route.get("/show_invoice_oforder",auth,authRole("ADMIN"),async (req, res) => {
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
  
});

route.get("/orderSummary_of_1",auth,authRole("ADMIN"), async (req, res) => {
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
});




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