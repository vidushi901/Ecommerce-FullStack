var express= require('express');
var router= express.Router();
var bcrypt= require('bcryptjs')
var jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
var userModule= require('../models/user')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function checkLoginUser(req,res,next) {
    var usertoken= localStorage.getItem('usertoken')
    try{
        if(req.session.uname){
        decoded=jwt.verify(usertoken,'logintoken')
        }
        else
            res.redirect('/');
    }catch(err){
        res.redirect('/');
    }
    next();
}

function checkuname(req,res,next) {
    var uname=req.body.uname;
    var unameexists= userModule.findOne({uname:uname})
    unameexists.exec((err,data)=>{
        if(err) throw err;
        if(data)
        {
        return res.render('register',{title:"Register", msg:'Username already exists'});
        }
        next();
    })    
}
router.get('/',function(req,res,next)
{
    var uname= localStorage.getItem('uname')
    if(req.session.uname)
    {
        res.redirect('dash') 
    }
    else
        res.render('register',{title:"Register", msg:''})
})
router.post('/',checkuname, function(req,res,next)
{
    var uname= req.body.uname;
    var password= req.body.password;
    password= bcrypt.hashSync(password,10)
    var userDetails=new userModule({
        uname:uname,
        password:password
    });
    userDetails.save((err,doc)=>{
        if(err) throw err;
        res.redirect('dash')
    })
})
module.exports=router;