const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const chatgrp = new Schema({
    sender_id:{type:mongoose.Types._ObjectId},
    receiver_id:{type:mongoose.Types._ObjectId},
    action:{type:Number,default:''},//1 for report and 0 for delete
    status:{type:Number,default:0},
    created_at:{type:Date,default:Date.now},
    updated_at:{type:String,default:''}
})
module.exports = mongoose.model('chatgrps',chatgrp)