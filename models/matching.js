const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const matches = new Schema({
    user_Id:{type:mongoose.Types.ObjectId},
    liked_userId:{type:mongoose.Types.ObjectId},
    like : {type:Number,required:true},//1 for like and 0 for not like
    status:{type:Number,default:0},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:String,default:''}
})
module.exports = mongoose.model('matches',matches)