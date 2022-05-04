const {sequelize}=require('../models');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const multer =require('multer');

const login_verify=async(req,res)=>{
    let {username,password}=req.body;
    // const salt= await bcrypt.genSalt(10)
    // password=await bcrypt.hash(password,salt);
    return sequelize.models.Customer.findOne({
        where :{email:username}
    }).then( async (data)=>{
        if(data){
            const get=await bcrypt.compare(password,data.password);
            if(get){
                res.redirect('/customer/commodities')
            }
            else{
                res.redirect('/')
            }
        }
        else{
            res.redirect('/')
        }
    })
}

const signUp=async(req,res)=>{
    let {
        fname,lname,email,password,
        address,gender,phone
    }=req.body;
    const salt= await bcrypt.genSalt(10)
    password=await bcrypt.hash(password,salt);
    
    return sequelize.models.Customer.findOne({
        where:{email:email}
    }).then((data)=>{
        if(data){
            res.send(" There is a user registered by this email ")
        } else{

        sequelize.models.Customer.create(
        {
            fname:fname,
            lname:lname,
            email:email,
            password:password,
            Location:address,
            Gender:gender,
            PhoneNo:phone
        }
        ).then(()=>{
            res.json({password,})
            
    })            
        }

    })
    
}
const readProducts=async(req,res)=>{
    // optional to use the userid or not 
    return sequelize.models.Category.findAll(
        {
            include:{
                model:sequelize.models.Product,
                where:{
                    available:true
                }
            }
        }
    ).then((data)=>{
        res.send(data).sendStatus(200);
    })
    // res.render("productrender")
}
const updateProfile=async(req,res)=>{

    let cid    //needs customer id from the header
    let {
        fname,lname,email,password,
        location,gender,phonenumber
    }=req.body;
    let user =await sequelize.models.Customer.findOne({
        where :{
            id:cid
        }
    })
    await user.set(
        {
            fname:fname,
            lname:lname,
            email:email,
            password:password,
            location:location,
            Gender:gender,
            phoneNo:phonenumber
        }
    )
    await user.save();

}
const buyProduct=async(req,res)=>{
    let {pid,amount,price}=req.body;
    let cid// needs customer id from the jwt 
    const today=new Date();
    const date=today;
    await  sequelize.models.Purchased.create({
        CustomerId:cid,
        ProductId:pid,
        date:date,
        amount:amount,
        fee:amount*price
    }).then(()=>{
        let product = sequelize.model.Product.findOne({
            attributes:['amount'],
            where:{
                id:pid
            }
        })
        product.set({
            amount:product.amount-amount
        })
        product.save();
    })
} 
const changePassoword=async(req,res)=>{
    let {oldpassword,newpassword}=req.body;
    let user= await sequelize.models.Customer.findOne({
        Attributes:['password'],
        where:{
            password:oldpassword
        }
    })
    if(user){
        user.set({
            password:newpassword
        })
    }
    else{
        res.status(401)
    }
}

module.exports={login_verify,signUp,readProducts,updateProfile,buyProduct,changePassoword}

