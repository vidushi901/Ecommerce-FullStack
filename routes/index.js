var express= require('express');
var router= express.Router();
var bcrypt= require('bcryptjs')
var jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
var userModule= require('../models/user')
var productModule= require('../models/product')
var categoryModule= require('../models/category')
var sendmail= require('./mail.js')
var getcat = categoryModule.find()
var fs = require('fs-extra')


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


router.get('/',function(req,res,next)
{    
    var uname= localStorage.getItem('uname')
    if(req.session.uname)
    {
        res.redirect('dash') 
    }
    else
        res.render('login',{title:"Login", msg:''})
           
})
router.post('/',function(req,res,next)
{
    var uname=req.body.uname;
    var password=req.body.password;
    var checkUser= userModule.findOne({uname:uname});
    checkUser.exec((err,data)=>{
        if(err) throw err;   
        else if(data) {
        var getpw= data.password;
        var getid= data._id;
        if(bcrypt.compareSync(password,getpw)){
            var token = jwt.sign({ userid: getid }, 'logintoken');
            localStorage.setItem('usertoken', token);
            localStorage.setItem('uname', uname);
            req.session.uname=req.body.uname;
            console.log(req.session.uname)
            req.session.userid= getid;
            res.redirect('dash')
        }else{
            res.render('login',{title:"Login",msg:'Invalid password'})
        }
        }
        else{
            res.render('login',{title:"Login",msg:'Invalid username'})
        }
    })
})

router.get('/dash',checkLoginUser, function(req,res,next)
{    
    var uname= req.session.uname;
    productModule.find(function(err,products){
        res.render('dash',{
            uname:uname,
            products:products})
    }).limit(9).sort({ date: -1 })                
});

router.get('/products',checkLoginUser,function(req,res,next)
{    
    var uname= req.session.uname;

    categoryModule.find(function(err,data){
        productModule.find(function(err,products){
            res.render('allproducts', {
                products: products,
                uname:uname,
                categories:data
            })
        }).sort({"title":1})
    }).sort({"name":1})

});
router.get('/products/:category',checkLoginUser, function (req, res) {
    var uname= req.session.uname;
    var name = req.params.category;

    categoryModule.find(function (err, data) {
        productModule.find({category: name}, function (err, products) {
            res.render('catproduct', {
                products: products,
                uname:uname,
                categories:data
            });
        }).sort({"title":1})
    }).sort({"name":1})

});

router.get('/products/:category/:product', checkLoginUser, function (req, res) {
    var uname= req.session.uname;
    var galleryImages = null;
    id=req.params.product
    productModule.findOne({_id: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages= files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        uname:uname
                    });
                }
            });
        }
    });

});
router.get('/contact',checkLoginUser,function(req,res,next)
{
    res.render('contact',{msg:''})
})

router.post('/contact',checkLoginUser,function(req,res,next)
{
    const {email,subject,message}= req.body;
    sendmail(email,subject,message, function(err,message){
        if(err)
            console.log('Error occurred');
    })
    res.render('contact',{msg:'Message sent successfully'})
})

router.get('/logout',checkLoginUser,function(req,res,next)
{
    req.session.destroy(function(err) {
        if(err)
        res.redirect('/')
    })
    localStorage.removeItem('usertoken')
    localStorage.removeItem('uname')
    res.redirect('/')
})


module.exports=router;