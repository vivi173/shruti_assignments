const Order = require('../model/order');
const Item= require('../model/item');

//implement pagination
const myCustomLabels = {
    totalDocs: 'total items',
    docs: 'itemsList',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next page No ',
    prevPage: 'previous page No',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
  };
  const index=(req, res,next)=>{
    if(req.query.page && req.query.limit){
      Item.paginate({},{page:req.query.page,limit: req.query.limit,customLabels: myCustomLabels})
      .then(data=> {
        res.status(200).json({data})
       
      })
      .catch(error=> {
        res.status(400).json({error})
    
      })
    }
    else{
      Item.find()
      Item.paginate({},{page:req.query.page,limit: req.query.limit,customLabels: myCustomLabels})
      .then(data=> {
        res.status(200).json({data})
      })
      .catch(error=> {
        res.status(400).json({error})
    
      })
    }
  
  }

  const del_multi_items=async(req,res)=>{


    const {delete_items_id} = req.body ;
    console.log("2="+delete_items_id);
    const query = { _id: { $in: delete_items_id} };  
    await Item.deleteMany(query).then(result => {
    console.log("Number of Records Deleted : "+ result["n"]);
    res.status(200).send("Number of Records Deleted : "+ result["n"])
 
})
.catch(err => {
    console.log("Error");
    console.log(err);
    res.status(400).send('Error in deletion -  '+err);
});

};
const update_multiitems= async (req, res) => {

try {
  const writeOperations = req.body.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { itemname: item.itemname },
        update: { price: item.price}

      }
    };
  });

  await Item.bulkWrite(writeOperations);

  res.json(req.body);
} catch (e) {
  res.status(500).json({ message: 'Something went wrong in /edit-order' });
}
};
const save_single_item=async(req,res)=>{

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
};


const save_multiitems=async(req,res)=>{

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
};


  module.exports = {index,del_multi_items,update_multiitems,save_multiitems,save_single_item};