const Order = require('../model/order');
const Item= require('../model/item');
const Register= require('../model/registers');
const bcrypt =require("bcryptjs");
const jwt =require("jsonwebtoken");



    const new_register=async(req, res)=>{
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
                const registered= await registerUser.save();
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
  }


    const login_check=async(req, res)=>{

  try{
    const  inputemail =req.body.email;
    const inputpassword =req.body.password;
    console.log("inputemail="+inputemail);
    const useremail = await Register.findOne({email:inputemail});
    //res.send(useremail);
    console.log("useremail="+useremail);
   // console.log(`${email} and  password is ${password}`)
  
  
  
  
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
  }

  module.exports = {new_register,login_check};
