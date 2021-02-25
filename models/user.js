const mongoose = require('mongoose');
const { number } = require('../controllers/authController');
const Schema =  mongoose.Schema;
const regis = new Schema({
    email_id:{type:String,default:''},
    password:{type:String,default:''},
    first_name:{type:String,default:''},
  
    birthday: { type:String,default:''},
    gender:{type:String,default:''},
    profile:{type:String,default:''},
    // otp:{type:Number,required:true},
    lat:{type:String,default:''},
    log:{type:String,default:''},

    device_type:{type:String,default:''},
    device_token:{type:String,default:''},

    phone_number:{type:Number,required:true},
    otp:{type:Number,required:true},
    country_code:{type:String,required:true},
    is_verify:{type:Number,default:0},
    is_register:{type:Number,default:0},
    is_payment:{type:Number,default:0},
    age:{type:String,default:''},
    tittle:{type:String,default:''},
    work:{type:String,default:''},
    bio:{type:String,default:''},
    education:{type:String,default:''},
 
    //users setting
     gender_Interest:{type:Number,default:2},//0 for women 1 for men and 2 for men and women both 
      distance:{type:String,default:100},
     age_Rangestart:{type:String,default:15},
     age_Rangend:{type:String,default:40},
     useCurrent_location:{type:String,default:0},
      new_Matches:{type:Number,default:0},
      messages:{type:Number,default:0},
      waves:{type:Number,default:0},
     check:{type:Number,default:0},//1 for update setting and 0 for fetch usersettings
      
     //users selfies
     selfie:{type:Array,default:[]},
     check_selfie:{type:Number,default:0},//1 for update and 0 for get


    status:{type:Number,default:0},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:String,default:''}
})
module.exports = mongoose.model('users',regis);