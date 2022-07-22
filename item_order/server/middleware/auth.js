const jwt =require("jsonwebtoken");
const Register = require("../model/registers");

function authRole(role){
    return (req,res,next)=>{
        const token1 = req.cookies.jwt;
        console.log("token1="+token1+"token1 ends=");

        const verifyUser1= jwt.verify(token1,process.env.SECRET_KEY);
       // const user=await Register.findOne({_id:verifyUser1._id});


         console.log("role1="+verifyUser1.role+"role1 ends ==");

            if(verifyUser1.role !== role){
                res.status(401)
                return res.send('not allowed, only admins allowed')
            }
             next()
         }
    }

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser= jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);
        const user=await Register.findOne({_id:verifyUser._id});
        console.log(user);


        next();
    }catch(error){
        res.status(401).send("Please log in "+error);
    }
}



module.exports = {auth,authRole};

// module.exports=(req,res,next)=>{
//     const token = req.headers.authorization;
//     console.log(token);
// }