const Order = require('../model/order');
const Item= require('../model/item');


var dbcourse = [];



// create and save new user
// exports.create = (req,res)=>{
//     // validate request
//     if(!req.body){
//         res.status(400).send({ message : "Content can not be emtpy!"});
//         return;
//     }

//     // new user
//     const user = new Userdb({
//         name : req.body.name,
//         email : req.body.email,
//         gender: req.body.gender,
//         status : req.body.status
//     })

//     // save user in the database
//     user
//         .save(user)
//         .then(data => {
//             //res.send(data)
//             res.redirect('/add-user');
//         })
//         .catch(err =>{
//             res.status(500).send({
//                 message : err.message || "Some error occurred while creating a create operation"
//             });
//         });

// }

// retrieve and return all users/ retrive and return a single user
exports.findall = (req, res)=>{   
        Order.find()
            .then(user => {
                res.send(user)
            })
            .catch(err => {
                res.status(500).send({ message : err.message || "Error Occurred while retriving order information" })
            })
     
}
////////



////////

exports.findallcalc1 = async (req, res)=>{  
console.log(req);
    try{
console.log(req);
     const    datauser=await Order.aggregate([
            {              
                $group: {
                    _id: { username: "$username" },
                    totalEmployee: { $sum: 1 }                 
                        }
                    }
        ]);
         //   console.log(res)
          // JSON.stringify(datauser)  
       // res.status(200).JSON.stringify(json(datauser));  
       // res.json(datauser);  
          JSON.stringify(res)            
       // res.status(200).json(datauser);
        //res.json(datauser)
    }catch(err){
        res.send('Error '+err)
    }
}


exports.findallcalc = async(req, res)=>{  
    let datauser; 

    datauser = await Order.aggregate([
        {
            
                $match: { username: "RAM" }
             
            // $group:
            // {
            //     _id:  "$userId" ,               
            //     totalorder: { $sum : 1 }
            // }
        }
    ]) 
    res.status(200).json({
        status: 'success',
        datauser });       
  
      //  res.json({datauser})

}
exports.findid = (req, res)=>{   
    try{
        const databyid= Order.findById(req.params.id)
        res.json(databyid)
    }catch(err){
        res.send('Error '+err)
    }
}

exports.findbyuserid = (req, res)=>{   
    try{
        const databyid= Order.find({userId:req.params.userId})
        res.json(databyid)
    }catch(err){
        res.send('Error '+err)
    }
}

// exports.findid= (req, res)=>{
//     if(req.query.id){
//         const id = req.query.id;
//         Order.findById(id)
//             .then(data =>{
//                 if(!data){
//                     res.status(404).send({ message : "Not found user with id "+ id})
//                 }else{
//                     res.send(data)
//                 }
//             })
//             .catch(err =>{
//                 res.status(500).send({ message: "Erro retrieving user with id " + id})
//             })
//     }   
// }

// Update a new idetified user by user id
// exports.update = (req, res)=>{
//     if(!req.body){
//         return res
//             .status(400)
//             .send({ message : "Data to update can not be empty"})
//     }

//     const id = req.params.id;
//     Userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false})
//         .then(data => {
//             if(!data){
//                 res.status(404).send({ message : `Cannot Update user with ${id}. Maybe user not found!`})
//             }else{
//                 res.send(data)
//             }
//         })
//         .catch(err =>{
//             res.status(500).send({ message : "Error Update user information"})
//         })
// }

// Delete a user with specified user id in the request
// exports.delete = (req, res)=>{
//     const id = req.params.id;

//     Userdb.findByIdAndDelete(id)
//         .then(data => {
//             if(!data){
//                 res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
//             }else{
//                 res.send({
//                     message : "User was deleted successfully!"
//                 })
//             }
//         })
//         .catch(err =>{
//             res.status(500).send({
//                 message: "Could not delete User with id=" + id
//             });
//         });
// }