var express= require('express');
var router= express.Router();
var bcrypt= require('bcryptjs')
var jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
var userModule= require('../models/user')
var productModule= require('../models/product')
var cartModule= require('../models/cart')
var categoryModule= require('../models/category')
var orderModule= require('../models/orders')
var getcat = categoryModule.find()
var fs = require('fs-extra');
const { render, fileLoader } = require('ejs');
var arr= new Array;

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

router.get('/',checkLoginUser,function(req,res,next)
{    
    var uname= localStorage.getItem('uname');
    var count;

    cartModule.find({uname:uname},function(err,products){
        count=0
        products.forEach(function(product){
            count++
        })
    })


        cartModule.find({uname:uname},function(err,products){
                res.render('cart', {
                    c: count,
                    products: products,
                    uname:uname
                })
        }) 
})
        /* count=c;
        cartModule.find({uname:uname},function(err,products){
            products.forEach(function(product){
                id= product.cid;
                productModule.findOne({_id:id},function(err,item){
                    if(item.stock>=product.quantity){
                        arr.push(product)
                    }
                    else if(item.stock===0){
                        cartModule.deleteOne({cid:id});
                    }
                    else{
                        product.quantity= item.stock;
                        product.save();
                        arr.push(product)
                    }                    
                })
            })
            
        })
    }).where('uname').equals(uname);  
    res.redirect('/cart/cart') */

/* router.get('/cart',load,function(req,res,next){
    var uname= localStorage.getItem('uname');
    console.log(arr);
    
}) */
router.get('/add/:product',checkLoginUser, function(req,res,next){
    var uname= localStorage.getItem('uname')
    id= req.params.product;
    productModule.findOne({_id:id}, function (err, product) {
        cartModule.findOne({cid: product._id, uname: uname}, function (err, result){
            if(err)
                console.log(err)
            if(result)
            {
                /* var data= product.toObject()
                var q=data.stock;
                productModule.findOneAndUpdate({_id: result.cid}, 
                    {$set:{stock:q-1}}, {new: true}, function (err, docs) {
                    if (err){
                        console.log(err)
                    }
                }); */
                result.quantity= result.quantity+1;
                result.save();
                res.redirect('/products')
            }
            else{
                var cartDetails = new cartModule({
                    title:product.title,
                    category:product.category,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    uname: uname,
                    cid: product._id
                });
               /* var data= product.toObject();
                q=data.stock;
                 productModule.findOneAndUpdate({_id: product._id}, 
                    {$set:{stock:q-1}}, {new: true}, function (err, docs) {
                    if (err){
                        console.log(err)
                    }
                }); */
                cartDetails.save((err, doc) => {
                    if (err) throw err;
                    res.redirect('/products')
                })
            }
        })
    })
})

router.get('/products/plusone/:p',checkLoginUser, function(req,res,next){
    var uname= localStorage.getItem('uname');
    id= req.params.p;
    cartModule.findOne({_id: id, uname: uname}, function (err, result){
        result.quantity= result.quantity+1;
        result.save();      
        res.redirect('/cart')
    })
})

router.get('/products/minusone/:p',checkLoginUser, function(req,res,next){
    var uname= localStorage.getItem('uname');
    id= req.params.p;
    cartModule.findOne({_id: id, uname: uname}, function (err, result){
        if(result.quantity !=1)
        {
            result.quantity= result.quantity-1;
            result.save();      
            res.redirect('/cart')
        }
        else{
            var del= cartModule.findOneAndDelete({_id: id, uname:uname})
            del.exec(function(err){
            res.redirect('/cart')
            })
        }
    })
})
router.get('/products/delete/:p',checkLoginUser, function(req,res,next){
    var uname= localStorage.getItem('uname');
    id= req.params.p;
    var del= cartModule.findOneAndDelete({_id: id, uname:uname})
    del.exec(function(err){
    res.redirect('/cart')
    })
})
router.get('/checkout',checkLoginUser,function(req,res,next){
    var uname= localStorage.getItem('uname');
    cartModule.find({uname:uname},function(err,products){
        products.forEach(function(product){
            var order = new orderModule({
                oid:product.cid,
                title: product.title,
                price: product.price,
                category: product.category,
                image: product.image,
                quantity: product.quantity,
                uname: product.uname
            });
            cartModule.deleteOne({uname:uname})
            order.save()
        })
        })
    cartModule.deleteMany({uname:uname},function(err,result){
        res.redirect('/cart/orders')
    })
    })
router.get('/orders',checkLoginUser,function(req,res,next){
    var count;
    var uname= localStorage.getItem('uname');
    orderModule.find({uname:uname},function(err,orders){
        count=0
        orders.forEach(function(order){
            count++
        })
    })

    orderModule.find({uname:uname},function(err,results){
        res.render('orders',{
            c:count,
            uname:uname,
            results:results
        })
    }).sort({"date":-1})
})
module.exports=router;