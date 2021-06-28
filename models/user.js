const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/ecommerce",{useNewUrlParser:true ,useUnifiedTopology:true});
var conn=mongoose.Collection;
var userSchema= new mongoose.Schema({
    uname:{
        type:String,
        required: true,
        index:{unique:true
        }},
    password:{
        type:String,
        required: true
    }
})
var User= mongoose.model('User',userSchema)
module.exports=User;