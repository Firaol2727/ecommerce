require('dotenv').config();
const {sequelize}=require('./models');
const express=require('express');
const jwt=require('jsonwebtoken');
const server=express();
const multer =require('multer');
const upload=multer({storage:multer.memoryStorage()})
//including my routers 
const customerroute=require('./routers/customer_route');
const adminroute=require('./routers/admin_route')
const path = require('path');
const { nextTick } = require('process');
var cookieParser = require('cookie-parser');
const { read } = require('fs');
const {login_verify}=require('./controllers/customer_function');
const category = require('./models/category');
const bcrypt=require('bcrypt')
function main(){
 sequelize.models.Category.bulkCreate(
[
    {
        name:"Electronics"
    },
    {
        name:"Cloth and Shoes"
    },
    {
        name:"Cosmotics"
    }
] 
)
//  create({
//             name:"cosmotics"
//         }).then((data)=>{
//             console.log(data);
//             console.log("has finished adding the categories ");
//         })
}
server.set('view engine','ejs');
server.use(express.json())
server.use(express.urlencoded({
    extended: true
    }));
 
server.use(cookieParser())
server.use('/admin',adminroute)
server.use('/customer',customerroute);
server.use(express.static('static'))
server.use('/css',express.static(__dirname+'static/css'))
server.use('/img',express.static(__dirname+'static/img'))
server.use('/js',express.static(__dirname+'static/img'))
// middlwares 
server.get('/',(req,res)=>{
    error=""
    res.render('loginpage')
})
server.get('/hmm',(req,res)=>{
    res.render('productrender')
}) 
server.get('/commodities',(req,res)=>{
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

        res.render('productrender',{data})
    })
})
server.post('/customer_verification',(req,res)=>{
    let {username,password}=req.body;
    // const salt= await bcrypt.genSalt(10)
    // password=await bcrypt.hash(password,salt);
    return sequelize.models.Customer.findOne({
        attributes:["id","password"],
        where :{email:username}
    }).then( async (data)=>{
        if(data){
            const get=await bcrypt.compare(password,data.password);
            if(get){
                const  userId=data.id
                const accessToken= await jwt.sign(userId,process.env.ACCESS_TOKEN_SECRET);
                res.cookie('jwtA',accessToken,{maxAge: 360000000},{httpOnly:true})
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

})

server.post('/tokenlearn',(req,res)=>{
    const {username,password} =req.body.username;
    const user ={   name:username,
                    password:password
                }
    const accessToken=jwt.sign(username,process.env.ACCESS_TOKEN_SECRET);
    res.json({accessToken:accessToken})
})
var PORT=3000;
server.listen(PORT,(err)=>{
    if(err) console.log(err)
    console.log(" Server is connected success full at 3000 ");
})
function authentication(req,res,next){
    const authheader=req.headers['authorization']
    const token=authheader.split(' ')[1]
    if(token==null) return res.sendStatus(401)
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.send(err)
        }
        req.user=user
        next()
    })
  
}
// server.get('/check',authentication,(req,res)=>{
//     res.send(req.user)
// })
server.get('/checkget/:name',(req,res)=>{
    res.json({
        msg:req.params
    })
})  
server.post('/check',(req,res)=>{
    const user ={ username:req.body.username,
                password :req.body.password } ;
     res.cookie("user",user)
    res.send(user)
})

