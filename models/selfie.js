const mongoose = require('mongoose');
const Schmea =  mongoose.Schema;
const pictures= new Schmea({
  user_Id:{type:mongoose.Types.ObjectId},
  selfie:{type:Array,required:true},
  check:{type:Number},//1 for update and 0 for get
  status:{type:Number,default:0},
  created_at:{type:Date,default:Date.now},
  updated_at:{type:String,default:''}
})
module.exports = mongoose.model('selfies',pictures)