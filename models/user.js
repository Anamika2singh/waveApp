const mongoose = require('mongoose');
const { number } = require('../controllers/authController');
const Schmea =  mongoose.Schema;
const regis = new Schmea({
    email_id:{type:String,default:''},
    password:{type:String,default:''},
    first_name:{type:String,default:''},
  
    birthday: { type:String,default:''},
    gender:{type:String,default:''},
    profile:{type:String,default:''},
    // otp:{type:Number,required:true},
    lat:{type:Number,default:''},
    log:{type:Number,default:''},

    device_type:{type:String,default:''},
    device_token:{type:String,default:''},

    phone_number:{type:Number,required:true},
    otp:{type:Number,required:true},
    country_code:{type:String,required:true},
    is_verify:{type:Number,default:0},

    age:{type:Number,default:0},
    tittle:{type:String,default:''},
    work:{type:String,default:''},
    bio:{type:String,default:''},
    education:{type:String,default:''},

    status:{type:Number,default:0},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:String,default:''}
})
module.exports = mongoose.model('users',regis);