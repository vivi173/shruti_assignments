const mongoose =require("mongoose");
const bcrypt =require("bcryptjs");
const jwt =require("jsonwebtoken");



const userSchema = new mongoose.Schema({
    firstname:{
        type :String,
        required :true
    },
    lastname:{
        type :String,
        required :true
    },
    email:{
        type :String,
        required :true,
        unique:true
    },
    password:{
        type :String,
        required :true
    },
    confirmpassword:{
        type :String,
        required :true
    },
    role:{
        type :String,
        required :true
    },
    tokens:[{
        token:{
            type :String
            
        }
    }]
})

//geretate token
userSchema.methods.generateAuthToken =async function(){
    try{
        console.log(this._id);
        console.log("role="+this.role+"role=ends");

        const token =jwt.sign({_id:this._id.toString(),
            role: this.role},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
        console.log(token);
        await this.save();
        return token;

    }catch(error){
        res.send("the error part"+ error);
        console.log("the error part"+error);
    }
}



userSchema.pre("save",async function(next){
    if(this.isModified("password")){
      //  console.log(`the current password is ${this.password}`);
        this.password =await bcrypt.hash(this.password,10);
       // console.log(`the current password is ${this.password}`);
        this.confirmpassword =await bcrypt.hash(this.password,10);
        //this.confirmpassword = undefined;
    }
    next();
})

const Register = new mongoose.model("Register",userSchema);

module.exports = Register;