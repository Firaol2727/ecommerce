const {sequelize}=require('../models')
const express=require('express')
const jwt =require('jsonwebtoken')
const router=require('express').Router();
const multer =require('multer');
const bcrypt=require('bcrypt')
const upload=multer({storage:multer.memoryStorage()})
var cookieParser = require('cookie-parser');
router.use(express.static('static'))
router.use('/css',express.static(__dirname+'static/css'))
router.use('/img',express.static(__dirname+'static/img'))
router.use('/js',express.static(__dirname+'static/img'))
router.use(cookieParser());
router.use(express.json())
router.use(express.urlencoded({
    extended: true
    }));
const {signUp,readProducts,updateProfile,buyProduct,changePassoword}=require('../controllers/customer_function');
const authentication = async(req,res,next)=>{
    // const authheader=req.headers['authorization']
    const token=req.cookies.jwtA;   
    if(token){
    //process.env.ACCESS_TOKEN_SECRET
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.send(err)
        }else{
            req.user=user;
            next();
        }

    })
    }
    else{
        res.redirect('/')
    }

}
const productauth=async(req,res,next)=>{
    const token=req.cookies.pr;   
    if(token==null)
    {
        res.redirect('/')
    }
    //process.env.ACCESS_TOKEN_SECRET
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,pr)=>{
        if(err){
            return res.send(err)
        }else{
            req.pr=pr;
            next();
        }

    })

}
// router.get('/',authentication,readProducts)

//  CUSTOMER REGISTERATION FORM 
router.get('/signup',(req,res)=>{
    let status=res.cookie.status;
    if(status){
        
        res.redirect(`customer/item/${status}`)
    }else{
        res.render('customerRegisterpage')
    }
    
})
//  PRODUCT DESCRIPTION PAGE
router.get('/item/:name/:id',(req,res)=>{
    // res.send({
    //     msg:"hello"
    // })
    let name=req.params.name;
    let id=req.params.id;
    return sequelize.models.Product.findOne({
        where:{id:id}
    }).then(async(data)=>{
        if(data){
            let status;
            
            let id=data.id;
            res.clearCookie("pr");
            res.clearCookie('status')
            const accessToken= await jwt.sign(id,process.env.ACCESS_TOKEN_SECRET);
            res.cookie("pr",accessToken,{httpOnly:true},{maxAge: 36000000})   
            res.cookie('status',name,{httpOnly:true},{maxAge: 36000000})
            res.render('itemdisplay',{data})
        }
        else{
            res.sendStatus(404);
        }
    }).catch((err)=>{
        res.sendStatus(500)
    })
})
//   PRODUCT SELLING CONFIRMATION PAGE
router.get('/buy',authentication,productauth, async(req,res)=>{
    let cid=req.user;
    let pid=req.pr;
    var today = new Date();
    sequelize.models.Product.findOne({
        where:{id:pid}
    }).then( async(data)=>{
        let amount=data.amount;
        let newamount=amount-1;
        await sequelize.models.Product.update({
            amount:newamount, 
        },
        {
            where:{
                id:pid
            }
        })
    return  sequelize.models.Purchased.create({
        CustomerId:cid,
        ProductId:pid,
        fee:data.price,
        amount:1,
        date:today
    })
}).then((data)=>{
    var today = new Date();
    data.message=today;
    res.render('thankyou',{data})
}).catch((err)=>{
    res.send(err)
})
})
//   PRODUCT RENDERING PAGE FOR REGISTERED USER
router.get('/commodities',(req,res)=>{
    return sequelize.models.Category.findAll(
        {
            attributes:['id'] ,
            include:{
                model:sequelize.models.Product,
                where:{
                    available:true
                }
            }
        }
    ).then((data)=>{
        if(data.length>0){
            res.render('productrender',{data})
        }else{ 
            res.send(" There Is no product available").sendStatus(404);
        }
        
    })
});
//  PRODUCT ELECTRONICS RENDERING PAGE FOR SIGNED USER 
router.get('/commodities/electronics',(req,res)=>{
    return sequelize.models.Category.findAll(
        {
            where:{id:1},
            attributes:['id'] ,
            include:{
                model:sequelize.models.Product,
                where:{
                    available:true
                }
            }
        }
    ).then((data)=>{
        // res.send(data).sendStatus(200)
        res.render('electronicsrender',{data})
    })
})
// PRODUCT CLOTH AND SHOES RENDERING FOR SIGNED USER PAGE
router.get('/commodities/boutique',(req,res)=>{
    return sequelize.models.Category.findAll(
        {
            attributes:['id'],
            where:{id:2},
            include:{
                model:sequelize.models.Product,
                where:{

                    available:true
                }
            }
        }
    ).then((data)=>{
        // res.send(data).sendStatus(200)
        res.render('boutiquerender',{data})
    })
})
// PRODUCT COSMOTICS RENDRING PAGE FOR SIGNED USER 
router.get('/commodities/cosmotics',(req,res)=>{
    return sequelize.models.Category.findAll(
        {
            where:{id:3},
            attributes:['id'] ,
            include:{
                model:sequelize.models.Product,
                where:{
                    available:true
                }
            }
        }
    ).then((data)=>{
        // res.send(data).sendStatus(200)
        res.render('cosmoticsrender',{data})
    })
})
// REGISERING THE CUSTOMER TO THE DATABASE 
router.post('/customer_verify',signUp);

router.get('/changepassword',authentication,(req,res)=>{
    let user=req.user;
    let {oldpassword,newpassword}=req.body;
    return sequelize.models.Customer.findOne({
        where:{id:user, password:oldpassword}
    }).then( async (data)=>{
        if(data){
           data.password=newpassword;
           await data.save();
        }
        else{
            res.json({
                msg:" Wrong password "
            })
        }

    })
})
router.get('/deleteaccount',authentication,(req,res)=>{
    let user=req.user;
    res.clearCookie('jwt');
    res.clearCookie('pr');
    return sequelize.models.Customer.findOne({
        where:{id:user}
    }).then( async (data)=>{
        if(data){
            data.password=newpassword;
            await data.delete();
            res.redirect('/');
        }
        else{
            res.json({
                msg:" Wrong password "
            })
        }
    })
})
router.get('/me',authentication,(req,res)=>{
    let element=""
    let id=req.user;
    return sequelize.models.Customer.findOne({
        attributes:{exclude:['password']},
        where:{id:id}
    }).then((data)=>{
        // res.send(data)
        res.render('me',{data,element})
    }).catch((err)=>{
        res.sendStatus(500)
    })
   
    
})
router.get('/me/changepassword',authentication,(req,res)=>{
    const element="something"
    const data=""
    res.render('me',{data,element})
})
router.get('/me/profile_picture',authentication,(req,res)=>{
    res.json({
        msg:" We didnt start showing profile picture"
    })
})
router.post('/me/password_verify',authentication,(req,res)=>{
    let {Oldpassword,newpassword,confirmpassword}=req.body;
    let id=req.user;
    // res.send(id)
    if(confirmpassword===newpassword){
      return sequelize.models.Customer.findOne({
        where:{id:id}
    }).then(async(data)=>{
        let opass=data.password;
        let get= await bcrypt.compare(Oldpassword,opass);
        if(get){
            const salt= await bcrypt.genSalt(10)
            newpassword=await bcrypt.hash(newpassword,salt);
            sequelize.models.Customer.update({
                    password:newpassword
            },{
                where:{id:id}
            })
            res.redirect('/customer/me')
        }
        else{
            res.json({msg:"Error Password"}).sendStatus(403)
        }
    })       
    } 
    else{ 
        res.json({msg:"Error"}).sendStatus(403)
    }

})
router.get('/me/logout',authentication,(req,res)=>{
        res.clearCookie('jwtA');
        res.clearCookie('pr');
        res.redirect('/customer/signup')

})

module.exports=router;