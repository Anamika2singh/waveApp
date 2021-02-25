const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const chatmsg = new Schema({
    chatgrp_id:{type:mongoose.Types._ObjectId}, 
    sender_id:{type:mongoose.Types._ObjectId},
    receiver_id:{type:mongoose.Types._ObjectId},
    message:{type:String,required:true},
    status:{type:Number,default:0},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:String,default:''}
})
module.exports = mongoose.model('chatmsgs',chatmsg)