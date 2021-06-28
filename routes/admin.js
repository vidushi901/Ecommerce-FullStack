var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp')
var fs = require('fs-extra')
var resizeImg = require('resize-img');
var jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
var categoryModule = require('../models/category')
var productmodule = require('../models/product')
var getcat = categoryModule.find()

function checkLoginAdmin(req, res, next) {
    var admintoken = localStorage.getItem('admintoken')
    try {
        if (req.session.uname) {
            decoded = jwt.verify(admintoken, 'adminlogintoken')
        }
        else
            res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
    next();
}

function checkcatname(req, res, next) {
    var name = req.body.name;
    var nameexists = categoryModule.findOne({ name: name })
    nameexists.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('addcategory', { msg: 'Category name already exists', c: 1 });
        }
        next();
    })
}



router.get('/', function (req, res, next) {
    res.render('admin', { msg: "" })

})

/* admin login credentials:
username:admin
passsword:admin */

router.post('/', function (req, res, next) {
    var uname = req.body.uname;
    var password = req.body.password;
    if (uname != "admin")
        res.render('admin', { title: "Login", msg: 'Invalid username' })
    else if (password != "admin")
        res.render('admin', { title: "Login", msg: 'Invalid password' })
    else {
        var token = jwt.sign({ userid: 123 }, 'adminlogintoken');
        localStorage.setItem('admintoken', token);
        req.session.uname = req.body.uname;
        console.log(req.session.uname);
        res.redirect('admin/admin_dash');
    }

})
router.get('/admin_dash',checkLoginAdmin, function (req, res, next) {
    res.render('admin_dash')
})

router.get('/addcategory',checkLoginAdmin, function (req, res, next) {
    res.render('addcategory', { msg: "", c: 2 })
})

router.post('/addcategory',checkLoginAdmin, checkcatname, function (req, res, next) {
    var name = req.body.name;
    var catDetails = new categoryModule({
        name: name
    });
    catDetails.save((err, doc) => {
        if (err) throw err;
        res.render('addcategory', { msg: "Category saved successfully", c: 0 })
    })
})
router.get('/categories',checkLoginAdmin, function (req, res, next) {
    var count;

    categoryModule.count(function (err, c) {
        count = c;
    });
    getcat.exec(function (err, data) {
        if (err) throw err;
        else
            res.render('categories', { records: data, count:count })
    })
})
router.get('/categories/delete/:id',checkLoginAdmin, function (req, res, next) {
    var cat_id = req.params.id;
    var cat_del = categoryModule.findByIdAndDelete(cat_id)
    cat_del.exec(function (err) {
        res.redirect('/admin/categories')
    })

});

router.get('/addproduct',checkLoginAdmin, function (req, res, next) {
    getcat.exec(function (err, data) {
        if (err) throw err;
        else
            res.render('addproduct', { records: data,msg:"" })
    })
})

router.post('/addproduct',checkLoginAdmin,function (req, res, next) {
    imagefile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    imagefile1 = typeof req.files.img1 !== "undefined" ? req.files.img1.name : "";
    imagefile2 = typeof req.files.img2 !== "undefined" ? req.files.img2.name : "";
    id = req.body.id;
    title = req.body.title;
    desc = req.body.desc;
    price = req.body.price;
    category = req.body.category;
    productmodule.findOne({ id: id }, function (err, product) {
    if (product) {
        getcat.exec(function (err, data) {
            if (err) throw err;
            else
                res.render('addproduct', { records: data,msg:'Product already exists' })
        })
    } 
    else {
    var product = new productmodule({
        id:id,
        title: title,
        desc: desc,
        price: price,
        category: category,
        image: imagefile,
        img1:imagefile1,
        img2: imagefile2
    });

    product.save(function (err) {
        if (err)
            return console.log(err);

        fs.mkdirSync('public/product_images/'+product._id,function (err) {
            return console.log(err);
        }); 
        fs.mkdirSync('public/product_images/'+product._id+'/gallery',function (err) {
            return console.log(err);
        }); 
        fs.mkdirSync('public/product_images/'+product._id+'/gallery/thumbs',function (err) {
            return console.log(err);
        }); 
        if (imagefile != "") {
            var productimg = req.files.image;            
            var productimg1 = req.files.img1;            
            var productimg2 = req.files.img2;

            var path = 'public/product_images/' + product._id + '/' + imagefile;
            var path1 = 'public/product_images/' + product._id + '/gallery/' +  imagefile1;
            var path2 = 'public/product_images/' + product._id + '/gallery/' +  imagefile2;

            var thumbsPath = 'public/product_images/' + product._id + '/gallery/thumbs/' + imagefile;
            var thumbsPath1 = 'public/product_images/' + product._id + '/gallery/thumbs/' + imagefile1;
            var thumbsPath2 = 'public/product_images/' + product._id + '/gallery/thumbs/' + imagefile2;

            productimg.mv(path, function (err) {
                if (err)
                    console.log(err);
                resizeImg(fs.readFileSync(path), {width: 200, height: 200}).then(function (buf) {
                    fs.writeFileSync(thumbsPath, buf);
                });
            });
            productimg1.mv(path1, function (err) {
                if (err)
                    console.log(err);
                resizeImg(fs.readFileSync(path1), {width: 100, height: 100}).then(function (buf) {
                    fs.writeFileSync(thumbsPath1, buf);
                });
            });
            productimg2.mv(path2, function (err) {
                if (err)
                    console.log(err);
                resizeImg(fs.readFileSync(path2), {width: 100, height: 100}).then(function (buf) {
                    fs.writeFileSync(thumbsPath2, buf);
                });
            });
        }
        res.redirect('/admin/products')
    })}
    })
})

router.get('/products',checkLoginAdmin, function (req, res, next) {
    var count;

    productmodule.count(function (err, c) {
        count = c;
    });

    productmodule.find(function (err, products) {
        res.render('products', {
            products: products,
            count: count
        });
    });
})
router.get('/products/delete/:id',checkLoginAdmin, function (req, res, next) {
    var product_id = req.params.id;
    var path = 'public/product_images/' + product_id;
    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            productmodule.findByIdAndRemove(product_id, function (err) {
                console.log(err);
            });
            res.redirect('/admin/products');
        }
    });

});

router.get('/products/editproduct/:id',checkLoginAdmin, function (req, res) {

    categoryModule.find(function (err, categories) {

        productmodule.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
                        res.render('editproduct', {
                            id:p.id,
                            title: p.title,
                            desc: p.desc,
                            records:categories,
                            category: p.category,
                            price: p.price,
                            image: p.image,
                            img1: p.img1,
                            img2:p.img2,
                            _id: p._id
                        });
                    }
                });
            }
        });

    });

});

router.post('/products/editproduct/',checkLoginAdmin, function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var imageFile1 = typeof req.files.img1 !== "undefined" ? req.files.img1.name : "";
    var imageFile2 = typeof req.files.img2 !== "undefined" ? req.files.img2.name : "";
    var id= req.body.id;
    var title = req.body.title;
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var imgo = req.body.imgo;
    var imgo1 = req.body.imgo1;
    var imgo2 = req.body.imgo2;
    var _id = req.body._id;

    var update= productmodule.findByIdAndUpdate(_id,{id:id,title:title,desc:desc,price:price,category:category,image:imageFile,img1:imageFile1,img2:imageFile2})
    update.exec((err,docs)=>{
    if(err) throw err;
    else{
            var productimg = req.files.image;            
            var productimg1 = req.files.img1;            
            var productimg2 = req.files.img2;


            fs.unlink('public/product_images/' + _id + '/' + imgo, function (err) {
            if (err)
                console.log(err);
            }); 
            fs.unlink('public/product_images/' + _id + '/gallery/' + imgo1, function (err) {
                if (err)
                    console.log(err);
            }); 
            fs.unlink('public/product_images/' + _id + '/gallery/' + imgo2, function (err) {
                if (err)
                    console.log(err);
            });  
            fs.unlink('public/product_images/' + _id + '/gallery/thumbs/' + imgo, function (err) {
                if (err)
                    console.log(err);
            }); 
            fs.unlink('public/product_images/' + _id + '/gallery/thumbs/' + imgo1, function (err) {
                if (err)
                    console.log(err);
            }); 
            fs.unlink('public/product_images/' + _id + '/gallery/thumbs/' + imgo2, function (err) {
                if (err)
                    console.log(err);
            });
            var path = 'public/product_images/' + _id + '/' + imageFile;
            var path1 = 'public/product_images/' + _id + '/gallery/' +  imageFile1;
            var path2 = 'public/product_images/' + _id + '/gallery/' +  imageFile2;

            var thumbsPath = 'public/product_images/' + _id + '/gallery/thumbs/' + imageFile;
            var thumbsPath1 = 'public/product_images/' + _id + '/gallery/thumbs/' + imageFile1;
            var thumbsPath2 = 'public/product_images/' + _id + '/gallery/thumbs/' + imageFile2;

            productimg.mv(path, function (err) {
                if (err)
                console.log(err);
                resizeImg(fs.readFileSync(path), {width: 200, height: 200}).then(function (buf) {
                    fs.writeFileSync(thumbsPath, buf);
                });
            });
            productimg1.mv(path1, function (err) {
                if (err)
                console.log(err);
                resizeImg(fs.readFileSync(path1), {width: 100, height: 100}).then(function (buf) {
                    fs.writeFileSync(thumbsPath1, buf);
                });
            });
            productimg2.mv(path2, function (err) {
                if (err)
                console.log(err);
                resizeImg(fs.readFileSync(path2), {width: 100, height: 100}).then(function (buf) {
                    fs.writeFileSync(thumbsPath2, buf);
                });
            });
             
    res.redirect('/admin/products');
    }
})
});


router.get('/logout',checkLoginAdmin, function (req, res, next) {
    req.session.destroy(function (err) {
        if (err)
            res.redirect('/')
    })
    localStorage.removeItem('admintoken')
    res.redirect('/')
})

module.exports = router;

