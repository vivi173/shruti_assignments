const mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    itemname : {
        type : String,
        required: true
    },
    price: {
        type: Number,
        required: true
        
    }
})
const Item = mongoose.model('item', itemSchema);
module.exports = Item;
