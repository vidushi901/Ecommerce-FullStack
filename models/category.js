const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/ecommerce",{useNewUrlParser:true ,useUnifiedTopology:true});
var conn=mongoose.Collection;
var categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required: true,
        index:{unique:true
        }}
})
var Category= mongoose.model('Category',categorySchema)
module.exports=Category;