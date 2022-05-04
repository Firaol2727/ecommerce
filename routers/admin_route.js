const {sequelize}=require('../models')
const express=require('express')
const jwt =require('jsonwebtoken')
const router=require('express').Router();
const multer =require('multer');
const upload=multer({storage:multer.memoryStorage()})
var cookieParser = require('cookie-parser');
router.use(express.static('static'))
router.use('/css',express.static(__dirname+'static/css'))
router.use('/img',express.static(__dirname+'static/img'))
router.use('/js',express.static(__dirname+'static/img'))
router.use(cookieParser());

const { productAdd,updateProduct,readPurchasedProduct}=require('../controllers/admin_function');
const verify =(req,res,next)=>{
    let {username,password}=req.body;
    return sequelize.models.Admin.findOne({
        where:{
            email:username,
            password:password
        }
    }).then( async (data)=>{
        if(data){
            const userId =data.id;
            const user =userId;
            const accessToken= await jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
            res.cookie('jwt',accessToken,{maxAge: 360000},{httpOnly:true})
            next();
        }
        else{
            let error = "wrong password or username ";
            res.render('loginadminpage',{error})
        }
    })
}
 const authentication = async(req,res,next)=>{
    
    // const authheader=req.headers['authorization']
    if(req.cookies.jwt){
        const token=req.cookies.jwt;   
        if(token==null)
        {
            res.redirect('/admin')
        }
        //process.env.ACCESS_TOKEN_SECRET
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
            if(err){
                return res.send(err)
            }
            req.user=user;
            next();
        })
    }
    else{
        res.redirect('/admin')
        }
    }
        
    // const token=await authheader.split(' ')[1]


router.get('/',(req,res)=>{
    let error;
    res.render("loginadminpage",{error})
})
router.post('/admin_login_verify',verify,(req,res)=>{
    res.redirect('./adminpage');
})
router.get('/adminpage',authentication,(req,res)=>{
    res.render('adminpage')
})
router.post('/product_register', upload.single('picture'),(req,res)=>{
     image=req.file.buffer.toString('base64');
    let {
        pname,price,category,amount,description
    }=req.body;
    category=parseInt(category)
    console.log(typeof (category) );
    sequelize.models.Product.create({
            name:pname,
            price:price,
            CategoryId:category,
            amount:amount,
            available:true,
            picture:image,
            description:description
        }).then(()=>{
            res.redirect('./adminpage')
        })
}
)
router.get('/update_product',authentication,(req,res)=>{ 
    let data="";
    res.render('updateproduct',{data}) 
})
router.post('/update_select',(req,res)=>{
    let id=req.body.id;
    // res.send(req.user);
    res.clearCookie('id');
    return sequelize.models.Product.findOne({
        attributes:{exclude:['picture']},
        where:{id:id}
    }).then((data)=>{
        // res.json({"data":data})
        if(data){
            data.error=" found";
            res.cookie('id',id,{httpOnly:true})
            res.render('updateproduct',{data})
        }
        else{
            // let error={ msg:" No product with this ID " }
            res.redirect('./update_product')
        }
    })
})
router.post('/update_product_verify',(req,res)=>{
    let {name,price,amount,description}=req.body;
    let id=req.cookies.id;

    sequelize.models.Product.findOne({
        where:{id:id}
    }).then( async(data)=>{
     
        let dname=data.name;
        let dprice=data.price
        let  damount=data.amount
        let ddescription=data.description
        if(name){
            dname=name;
        }
        if(price){
            dprice=price;
        }
        if(amount){
            damount=amount;
        }
        if(description){
            ddescription=description;
        }
        
        await sequelize.models.Product.update({
            name:dname,
            price:dprice,
            damount:amount,
            description:ddescription
        },{
            where:{id:id}
        });

        // data.error=" Successfully updated the data ";
       
    }).then(()=>{
        res.redirect('/admin/update_product')
    })
    
})
router.get('/selled',authentication,(req,res)=>{
    return sequelize.models.Purchased.findAll({
        
        include:
        [
        {
            model:sequelize.models.Customer,
            attributes:['fname','lname','Location']
        },
        {
            model:sequelize.models.Product,
            attributes:['name']
        }
    ]
    }).then((data)=>{
        res.render('purchasedtable',{data})
        // res.send(data);

        // console.log(data[0].Product.name);
        // console.log(data[0].Customer.fname);
        // console.log(data[1].Product.name);
        // console.log(data[1].Customer.fname);
        // console.log(data);
        // Object.entries(data).forEach(entry => {
        //     // let key = entry[0];
            // let value = entry[1];
            
            // entry.forEach((element)=>{
            //     console.log(element);
            //     // console.log(element.Customer.fname);
            // })
           
            
            
            // item=entry;
          });
        //   res.json({"entry":entry})
         


            // res.send(data);
           
        // })

   
})   
router.get('/changepassword',authentication,(req,res)=>{
    res.render('changepassword')
})
router.get('/changepassword_verify',authentication,(req,res)=>{
    let Aid=req.user;
    const {oldpassword,newpassword}=req.body;
    const user={
        oldpassword:oldpassword,
        newpassword:newpassword
    }
    res.send(user).sendStatus(200)
    return sequelize.models.Admin.findOne({
        where:{id:Aid,
                password:oldpassword}
    }).then(async(data)=>{
        if(data){
            await data.set({
                password:newpassword
            })
            await data.save();
            res.redirect('/adminpage')
        }
        else{
            res.json({msg:"password incorrect"})
        }
    })
    
})
module.exports=router;