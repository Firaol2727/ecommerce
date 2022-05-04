const { sequelize } = require("../models")
const multer =require('multer');
const upload=multer({storage:multer.memoryStorage()})

const productAdd=async (req,res)=>{
    const image=req.file.buffer.toString('base64');
    let {
        pname,price,cid,amount,description
    }=req.body;
    
    // console.log(image);
    sequelize.models.Product.create({
            name:pname,
            price:price,
            CategoryId:cid,
            amount:amount,
            available:true,
            CategoryId:catid,
            picture:image
        }).then(()=>{
            res.json({ 
                msg:" The product has been registered succeessfully"
            })
        })

}
const updateProduct=async (req,res)=>{
    let {name,amount,description,available,catid}=req.body();
    let product=sequelize.models.Product.findOne({
        name:name,
    })
    if(product){
    await product.set({
        name:name,
        amount:amount,
        available:available,
        CategoryId:catid
    })
    await product.save();        
    }
    else{
        console.log("no ");
    }

}
const readPurchasedProduct= async(req,res)=>{
    return sequelize.models.Purachased.findAll({
        include:[
        {model:sequelize.models.Customer,
        attributes:['fullname']},
        {model:sequelize.models.Product,
        attributes:['name']}
        
    ]}).then(()=>{

    })
}

module.exports={ productAdd,updateProduct,readPurchasedProduct};