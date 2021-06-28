const express = require('express');
const session = require('express-session')
const bodyParser = require("body-parser");
const rimraf = require("rimraf");
const path = require('path');
const { urlencoded } = require('body-parser');
const expressValidator = require('express-validator')
const fileupload = require('express-fileupload')
const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const cartRouter = require('./routes/cart');
const adminRouter = require('./routes/admin');
const port = 80;
var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
}))

app.use(fileupload())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator({
        customValidators: {
                isImage: function (value, filename) {
                        var extension = (path.extname(filename)).toLowerCase();
                        switch (extension) {
                                case '.jpg':
                                        return '.jpg';
                                case '.jpeg':
                                        return '.jpeg';
                                case '.png':
                                        return '.png';
                                case '':
                                        return '.jpg';
                                default:
                                        return false;
                        }
                }
        }
}));
app.use('/', indexRouter)
app.use('/register', registerRouter)
app.use('/admin', adminRouter)
app.use('/cart', cartRouter)
app.use(express.static('public'));
app.listen(port, () => {
        console.log(`The application started successfully on port ${port}`);
});

