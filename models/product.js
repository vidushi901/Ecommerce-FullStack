const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/ecommerce",{useNewUrlParser:true ,useUnifiedTopology:true,useFindAndModify: false });
var conn=mongoose.Collection;
var productSchema= new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    img1: {
        type: String,
        required: true
    },
    img2: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default : Date.now
    }

})
var Product= mongoose.model('Product',productSchema)
module.exports=Product;