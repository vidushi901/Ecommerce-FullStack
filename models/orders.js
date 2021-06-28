const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/ecommerce",{useNewUrlParser:true ,useUnifiedTopology:true});
var conn=mongoose.Collection;
var orderSchema= new mongoose.Schema({

    title: {
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
    quantity:{
        type: Number,
        required: true
    },
    uname:{
        type: String,
        required: true
    },
    oid:{
        type:String,
        required:true
    },
    date:{
        type: Date,
        default : Date.now
    }
})
var order= mongoose.model('order',orderSchema)
module.exports=order;