const mongoose = require('mongoose');
const url= 'mongodb://localhost/AlienDBex';

const connectDB = async () => {
    try{
        // mongodb connection string    

        await mongoose.connect(url, {useNewUrlParser: true});
const con=mongoose.connection  
con.on('open',()=>{
    console.log('connected....')
})
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
module.exports = connectDB