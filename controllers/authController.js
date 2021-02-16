const express = require('express');
const mongoose = require('mongoose')
const helper = require('../helpers/response');
const {Validator} = require('node-input-validator');
var jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
const multer = require('multer');
mongoose.set('useFindAndModify', false);

const userTable = require('../models/user');
let saltRounds = 10;

//user register
exports.register = async(req,res,next)=>{
    try{
//   let pics =[];
//   req.files.forEach(element=>{
//     pics.push(element.filename)
// })
// console.log(pics);

 const v = new Validator(req.body,{
    email_id:'required|email',
    password:'required',
    first_name:'required',
    phone_number:'required|integer',
    birthday:'required',
    gender:'required',
 })
 const matched = await v.check();
 let email_id=v.errors.email_id?v.errors.email_id.message:''
 let password=v.errors.password?v.errors.password.message:''
 let first_name=v.errors.first_name?v.errors.first_name.message:'' 
 let phone_number=v.errors.phone_number?v.errors.phone_number.message:''
 let birthday=v.errors.birthday?v.errors.birthday.message:''
 let gender=v.errors.gender?v.errors.gender.message:''
if(!matched){
      let err=email_id+password+first_name+phone_number+birthday+gender
   helper.validation_error(res,err)
}
 else{
       let found = await userTable.findOne({'phone_number':req.body.phone_number})
     
  if(found){
      console.log(found)
      if(found.is_verify){
         console.log("verified");
           let checkDuplicate =await  userTable.findOne({'email_id':req.body.email_id})
               if(checkDuplicate){
                    helper.duplicate(res,"already registered with this mail")
                    return;
                             }
                
                 let updateTable = await userTable.findByIdAndUpdate({'_id':found._id},{$set:
                             {email_id:req.body.email_id,
                                password:bcrypt.hashSync(req.body.password,saltRounds),
                                first_name:req.body.first_name,
                                birthday:req.body.birthday,
                                gender:req.body.gender,
                                profile:req.file.filename}
                            })
                  if(updateTable ){
                //    console.log("registered successfully");
                      userTable.findOne({'_id':found._id},(err,data)=>{
                          if(err)  helper.db_error(res,err);
                            else helper.success(res,"registered successfully",data)
                                  })   
                                    return;   
                                      }
                     helper.went_wrongwtihoutE(res)
          return;
                }
          helper.login_failed(res,"verify number then login")
}
 else{
    helper.not_found(res,"this number not found in the  table")
 }
 }
}
   catch(err){
    console.log(err)
    helper.went_wrong(res,err)
 }
}
//user login
exports.login = async(req,res,next)=>{
try{
    const v = new Validator(req.body,{
        phone_number:'required|integer',
        password:'required'
    })
    const matched = await v.check();
    let phone_number = v.errors.phone_number?v.errors.phone_number.message:''
    let password= v.errors.password?v.errors.password.message:''
    if(!matched){
         let err = phone_number+password
         helper.validation_error(res,err)
    }
    else{
        let found = await userTable.findOne({'phone_number':req.body.phone_number})
        if(found){
        
             bcrypt.compare(req.body.password , found.password,(err,user)=>{
                 if(user == true){
                    let token = jwt.sign(found.toJSON(),'LOG_KEY');
                              console.log(token);
                              let check = found.toJSON();
                              check.token = token
                            //   res.status(200).json({statusCode:200,message:"login succesfully",result : check})
                              helper.success(res,"login successfully",check)
                 }
                 else{
                    helper.login_failed(res,"password not matched")
                 }
             })
             return;
        }
            helper.login_failed(res,"not register with this phone_number")
    }
}
catch(err){
    console.log(err)
    helper.went_wrong(res,err)
   }
}
//user add a phone_number
exports.number=async(req,res,next)=>{
   try{
    const v = new Validator(req.body,{
        phone_number:'required|integer',
        country_code:'required'
     })
     const matched = await v.check();
     let phone_number=v.errors.phone_number?v.errors.phone_number.message:''
     let country_code=v.errors.country_code?v.errors.country_code.message:''
      if(!matched){
          let err=phone_number+country_code
       helper.validation_error(res,err)
      }
      else{
let checkDuplicate = await userTable.findOne({'phone_number':req.body.phone_number,'country_code':req.body.country_code})
    if(checkDuplicate){
        helper.duplicate(res,"already added")
    }
    else{
        userTable.create({
            phone_number:req.body.phone_number,
            country_code:req.body.country_code,
            otp:Math.floor(1000+Math.random()*9000)
          }).then(user=>{helper.success(res,"number saved",user)})
          .catch(err=>{helper.db_error(res,err)})
    }
}
}
catch(err){
    console.log(err)
    helper.went_wrong(res,err)
   }
}
//user verify phone_number through otp
exports.otpVerify=async(req,res,next)=>{
    try{

        const v = new Validator(req.body,{
            phone_number:'required|integer',
            otp:'required|integer'
         })
         const matched = await v.check();
         let phone_number=v.errors.phone_number?v.errors.phone_number.message:''
         let otp=v.errors.otp?v.errors.otp.message:''
          if(!matched){
              let err=phone_number+otp
           helper.validation_error(res,err)
          }
          else{
     let found = await userTable.findOne({'phone_number':req.body.phone_number})
     if(found){
       console.log(found)
       if(found.otp == req.body.otp){
        userTable.findByIdAndUpdate({'_id':found._id},{$set:{is_verify:1}},(err,result)=>{
            if(result){
                helper.successWithnodata(res,"otp verified")
            }else{
                helper.db_error(res,err)
            }
        })
        return;
       }
        helper.login_failed(res,"otp not matched")
        return;
     }
        helper.not_found(res," this number not found")
    }
}
    catch(err){
        console.log(err)
        helper.went_wrong(res,err)
       }
}

   
