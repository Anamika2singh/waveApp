const mongoose = require('mongoose');
const Schmea =  mongoose.Schema;
const usersetting= new Schmea({
  user_Id:{type:mongoose.Types.ObjectId},
  gender_Interest:{type:Number,required:true},//0 for women 1 for men and 2 for men and women both 
   distance:{type:String,default:''},
   age_Range:{type:String,default:''},
  useCurrent_location:{type:Number,default:0},
   new_Matches:{type:Number,default:0},
   messages:{type:Number,default:0},
   waves:{type:Number,default:0},
  check:{type:Number,required:true},//1 for update and 0 for fetch
  status:{type:Number,default:0},
  created_at:{type:Date,default:Date.now},
  updated_at:{type:String,default:''}
})
module.exports = mongoose.model('settings',usersetting)