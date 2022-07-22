const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    userId1: Number,
    username: String,   
    
    products:[
        {
            item_id: String,
            item_name: String,
            item_price: Number,
            item_qty: Number
        }
    ],
    total_price:Number,
    total_quantity:Number,
    gst_amt:Number,
    packing_charge:Number,
    grand_total:Number
   
});

const Order = mongoose.model('order', orderSchema);
    
// Exporting our model objects
module.exports = Order;


