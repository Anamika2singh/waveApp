const express = require('express');
const mongoose = require('mongoose')
const app=express()
const helper = require('../helpers/response');
const {Validator} = require('node-input-validator');
var jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
const multer = require('multer');
mongoose.set('useFindAndModify', false);
const fs = require('fs');

const userTable = require('../models/user');
const selfieTable = require('../models/selfie');
const settingTable = require('../models/setting');
const { findOne } = require('../models/user');

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
    lat:'required',
    log:'required'
 })
 const matched = await v.check();
 let email_id=v.errors.email_id?v.errors.email_id.message:''
 let password=v.errors.password?v.errors.password.message:''
 let first_name=v.errors.first_name?v.errors.first_name.message:'' 
 let phone_number=v.errors.phone_number?v.errors.phone_number.message:''
 let birthday=v.errors.birthday?v.errors.birthday.message:''
 let gender=v.errors.gender?v.errors.gender.message:''
 let lat=v.errors.lat?v.errors.lat.message:''
 let log=v.errors.log?v.errors.log.message:''
if(!matched){
      let err=email_id+password+first_name+phone_number+birthday+gender+lat+log
   helper.validation_error(res,err)
}
 else{
       let found = await userTable.findOne({'phone_number':req.body.phone_number})
     
  if(found){
      console.log(found)
      if(found.is_verify){
         console.log("verified");
      let checkDuplicate =await  userTable.findOne({'email_id':req.body.email_id,'phone_number':req.body.phone_number})
               if(checkDuplicate){
                    helper.duplicate(res,"already registered with this mail and phone_number")
                    return;
                             }
                       let age =  helper.getAge(req.body.birthday) //calling getage to calculate age 
                      //  console.log("your age is "+age)
                 let updateTable = await userTable.findByIdAndUpdate({'_id':found._id},{$set:
                             {
                                age:age,
                                email_id:req.body.email_id,
                                password:bcrypt.hashSync(req.body.password,saltRounds),
                                first_name:req.body.first_name,
                                birthday:req.body.birthday,
                                age: age,
                                gender:req.body.gender,
                                lat:req.body.lat,
                                log:req.body.log ,
                                profile:req.file.filename,
                                is_register:1,
                                device_type:req.body.device_type,
                                device_token:req.body.device_token
                                }
                            })
                  if(updateTable ){
                //    console.log("registered successfully");
                      userTable.findOne({'_id':found._id},(err,data)=>{
                          if(err) {
                            helper.db_error(res,err);
                          } 
                            else{ 
                                console.log(data.profile)
                                let url=data.profile;
                           let getImage = ('http://192.168.1.131:3000/'+url)//append link with filename
                           console.log(getImage)
                           let check = data.toJSON();
                             check.getImage = getImage
                   
                             let token = jwt.sign(data.toJSON(),'LOG_KEY');//generating token after  succcessfull register of the client
                             console.log(token);
                             check.token = token

                            helper.success(res,"registered successfully",check)}
                                  })   
                                    return;   
                                      }
                     helper.db_errorwithoutE(res)
          return;
                }
          helper.login_failed(res,"verify number then register")
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
        country_code:'required',
        phone_number:'required|integer',
        password:'required'
    })
    const matched = await v.check();
    let country_code = v.errors.country_code?v.errors.country_code.message:''
    let phone_number = v.errors.phone_number?v.errors.phone_number.message:''
    let password= v.errors.password?v.errors.password.message:''
    if(!matched){
         let err = phone_number+password+country_code
         helper.validation_error(res,err)
    }
    else{
        let found = await userTable.findOne({'phone_number':req.body.phone_number,'country_code':req.body.country_code})
        if(found){
        //    console.log(found)
            if(found.is_register){
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
            helper.login_failed(res,"first register then login")
           return 
        }
            helper.login_failed(res," this number not added")
    }
}
catch(err){
    console.log(err)
    helper.went_wrong(res,err)
   }
}
//login with phone_number
exports.loginPhone = async(req,res,next)=>{
  try{

    const v = new Validator(req.body,{
      country_code:'required',
      phone_number:'required|integer',
  })
  const matched = await v.check();
  let country_code = v.errors.country_code?v.errors.country_code.message:''
  let phone_number = v.errors.phone_number?v.errors.phone_number.message:''
  if(!matched){
       let err = phone_number+country_code
       helper.validation_error(res,err)
  }
  else{
     let found = await userTable.findOne({'phone_number':req.body.phone_number,'country_code':req.body.country_code})
     if(found){
         console.log(found)
         if(found.is_verify){
            console.log("verified")
            if(found.is_register){

              console.log(found.profile)
              let url=found.profile
         let getImage = ('http://192.168.1.131:3000/'+url)
  
               console.log("regitered")
               let token = jwt.sign(found.toJSON(),'LOG_KEY');
               console.log(token);
               let check = found.toJSON();
               check.token = token
                check.getImage = getImage
               helper.success(res,"login successfully",check)
            }
            else{
               console.log(" first regitered")
               helper.login_failed(res,"first registered")
            }
         }
         else{
           console.log("first verify")
           helper.login_failed(res,"first verify your number")
         }
     }
     else{
       console.log("not found")
     helper.not_found(res,"not found")
     }
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
        country_code:'required|integer'
     })
     const matched = await v.check();
     let phone_number=v.errors.phone_number?v.errors.phone_number.message:''
     let country_code=v.errors.country_code?v.errors.country_code.message:''
      if(!matched){
          let err=phone_number+country_code
       helper.validation_error(res,err)
      }
      else{

        userTable.create({
            phone_number:req.body.phone_number,
            country_code:req.body.country_code,
            otp:Math.floor(1000+Math.random()*9000)
          }).then(user=>{helper.success(res,"number saved",user)
            })
          .catch(err=>{helper.db_error(res,err)})
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
exports.getuserProfile = async(req,res,next)=>{
    try{
 let user = await userTable.findOne({'_id':req.userData._id})
   if(user){
     console.log(user)
     helper.success(res,"user profile",user)
   }
    else{
      console.log("not found in the table")
      helper.not_found(res,"not found in the table")
    }
}
     catch(err){
        helper.went_wrong(res,err)
     }
      
}
exports.editProfile = async(req,res,next)=>{
  try{
    let user = req.userData;
      console.log(user._id);
 
  let get = await userTable.findOne({ _id: user._id });
  if (get) {
    console.log(get)
  
    if(req.file!= undefined){
      if(get.profile){
        let dir='./public/images'
        let url=get.profile;
        fs.unlinkSync(dir+'/'+url)//deleting picture from folder
        console.log("deleted")
      }
        
      
    }
    var arr = {};
    const its = ["first_name","birthday","gender","tittle", "work","bio","education","profile"];
    for (const iterator of its) {
      console.log(iterator)  
      if (req.body[iterator]) {
        arr[iterator] = req.body[iterator];
      }

        if(iterator == "birthday"){
           if(req.body.birthday){
            console.log(" in bdy")
            let age =  helper.getAge(req.body.birthday) //calling getage to calculate age 
            arr['age'] = age
           }
          }
         if(iterator == "profile"){
              if(req.file != undefined){
                console.log(" in profile")
                 let pic = req.file.filename
                 arr[iterator]= pic
            }
          }
       
    
          
      }
    console.log(arr);
    let update = await userTable.findByIdAndUpdate(
      { _id: user._id },
      { $set: arr }
    );
    if(update){
       console.log("updated")
       userTable.findOne({'_id':user._id },(err,updateData)=>{
           if(err) helper.went_wrong(res,err)
           else helper.success(res,"user updated successfully",updateData)
       })
    }else{
      helper.db_errorwithoutE(res)
    }
  }
  else{
    helper.not_found(res,"user not found in the table" )
  }
}
catch(err){
    helper.went_wrong(res,err)
 }
}
exports.matches = async(req,res,next)=>{
  try{
   console.log(req.userData)
   let found = await userTable.findOne({'_id':req.userData._id})
   if(found){
          console.log("user exists")
         console.log(found)
         let new_data = []
         userTable.find({},{created_at:0,updated_at:0,status:0,},(err,data)=>{
       if(data){
        //  console.log(data.profile)
         data.forEach(element=>{
             console.log(element.profile)
                    let url=element.profile;
           let getImage = ('http://192.168.1.131:3000/'+url)//append link with filename
           console.log(getImage)
           let check = element.toJSON();
         check.getImage = getImage
        //  console.log(check)
         new_data.push(check)
         })
        
          console.log(new_data)

          helper.success(res,"all matches",new_data)
       }
          else{
            console.log("no matches found")
             helper.not_found(res,"no matches found")
           }
         })
   }
   else{
     helper.not_found(res,"user not exists")
   }
}
catch(err){
  helper.went_wrong(res,err)
}
}
exports.selfiebook = async(req,res,next)=>{
  try{
  console.log(req.userData._id)
  let found = await userTable.findOne({'_id':req.userData._id})
  if(found){
    if(req.body.check == 1){
      console.log("to add pic")
            let is_selfies = await selfieTable.findOne({'user_Id':req.userData._id})
            if(is_selfies){
                   console.log(is_selfies)
                //  res.send(is_selfies)
                  console.log("already in db"+is_selfies.selfie.length)
                  let len = is_selfies.selfie.length
                  let can_add = (5-len);
              if(len<5)
                 {

                    console.log("you can add")
                    let selfie_arr=[]
                    req.files.forEach(element => {
                   selfie_arr.push(element.filename) 
                        })
                   console.log(selfie_arr)
                   console.log("adding length"+selfie_arr.length)
                   let adding_len=selfie_arr.length;
                    if(adding_len > can_add){
                    console.log("you can add only"+can_add)
                    helper.went_wrongWithdata(res,"you can add only",can_add)
                    }
                     else{

                 let final_arr= is_selfies.selfie.concat(selfie_arr)//using concat to join both the array of images
                  console.log(final_arr)
                  console.log(is_selfies._id)
    let updated_selfie = await selfieTable.findByIdAndUpdate({'_id':is_selfies._id},{$set:{'selfie':final_arr}})   
               if(updated_selfie){
                  console.log("updated")
                  console.log(updated_selfie)
                helper.successWithnodata(res,"succesfully added pictures")
               }    
               else{
                 console.log("server errror");
                 helper.db_errorwithoutE(res)
               }        
                     }
                  }
            else{
              console.log("limit exceed first delete some")
            helper.login_failed(res,"limit exceed you can add only five first delete some")
              }
                
            }
            else{ //first time adding selfie
              let selfie_arr=[]
               req.files.forEach(element => {
              selfie_arr.push(element.filename) 
                   })
  
                 console.log(selfie_arr);
                let data = await selfieTable.create({
                         user_Id: req.userData._id,
                         selfie:selfie_arr,
               })
           if(data){
                 console.log(data)
                 helper.success(res,"successfully added selfie",data)
             }
           else{
           helper.db_errorwithoutE(res)
              }      
              
            }

    }
    
    else{
       let is_selfies = await selfieTable.findOne({'user_Id':req.userData._id})
       if(is_selfies){
          console.log(is_selfies)
          helper.success(res,"selfies",is_selfies)
       }
       else{
         console.log("not found first take some selfie")
           helper.not_found(res,"not found first take some selfie")
       }
    }
  }
  
  else{
    console.log("user not found")//user not found in table
  }
  }
  catch(err){
    helper.went_wrong(res,err)
  }
}
exports.getselfiebook = async(req,res,next)=>{
  try{
    console.log(req.userData)
    console.log(req.userData._id)
    let selfiedata = await selfieTable.find({'user_Id':req.userData._id},{status:0,updated_at:0,created_at:0})
    if(selfiedata){
       console.log(selfiedata)
       helper.success(res,"all selfies",selfiedata)
    }
    else{
      console.log("no selfie added")
      helper.not_found(res,"no selfie added")
    }
  }
  catch(err){
    helper.went_wrong(res,err)
  }
}
exports.Setting = async(req,res,next)=>{
  try{
     console.log("heyy");
     console.log(req.userData._id);
     let found = await userTable.findOne({'_id':req.userData._id})
    
     if(found){
       if(req.body.check == 1){ //1 for update setting
      
     let usersetting = await settingTable.findOne({'user_Id':req.userData._id})//if user setting exists then update
        if(usersetting){
          console.log("setting table"+usersetting);
          console.log(usersetting._id)
       var arr = {};
 const its = ["gender_Interest","distance","age_Range","useCurrent_location", "new_Matches","messages","waves"];
       for (const iterator of its) {
        console.log(iterator)  
        if (req.body[iterator]) {
          arr[iterator] = req.body[iterator];
         }
        }
         console.log(arr);
         let update = await settingTable.findByIdAndUpdate(
           { '_id':usersetting._id},
           { $set: arr }
         );
         if(update){
           
            console.log("updated")
            settingTable.findOne({'_id':usersetting._id},(err,updateData)=>{
                if(err) helper.went_wrong(res,err)
                else helper.success(res,"user setting updated successfully",updateData)
            })
         }else{
           helper.db_errorwithoutE(res)
         }
      }
        else{ //user setting not present then create user setting


      settingTable.create({
        user_Id:req.userData._id,
        gender_Interest:req.body.gender_Interest,//0 for women 1 for men and 2 for men and women both 
         distance:req.body.distance,
         age_Range:req.body.age_Range,
         useCurrent_location:req.body.useCurrent_location,
         new_Matches:req.body.new_Matches,
         messages:req.body.messages,
         waves:req.body.waves,
        check:req.body.check,//1 for update and 0 for fetch
      }).then(user=>{helper. success(res,"successfully added setting",user)})
      .catch(err=>{helper.db_error(res,err)})
      }

    }
      else{ //o for fetch setting
         let usersetting = await settingTable.findOne({'user_Id':req.userData._id})
          if(usersetting){
            console.log(usersetting)
            helper.success(res,"user setting",usersetting)
          }
          else{
            console.log("something went wrong!")
             helper.not_found(res,"not found please add setting first")
          }
      }
}
  else{
    console.log("user not exists")
  }
}
  catch(err){
    helper.went_wrong(res,err)
  }
}
exports.logout = async(req,res,next)=>{
  try{
   console.log(req.userData)
  let data = await userTable.findOne({'_id':req.userData._id})
  if(data){
    console.log(data)
    console.log(data.device_type)
    console.log(data.device_token)
       if(data.device_type && data.device_token){
        let update = await userTable.findByIdAndUpdate({'_id':req.userData._id},{$set:{'device_type':'','device_token':''}})
          if(update){
            console.log("updated successfully")
        helper.success(res,"logout successfully")
          }
          else{
            console.log("server error")
            helper.db_errorwithoutE(res)
          }
        }
           else{
          console.log("please enter device type and device token during register")
           helper.login_failed(res,"please login again fill device type and device token")
    }
  }
   else{
     console.log("user not found")
     helper.not_found(res,"user not found")
   }
  }
  
    catch(err){
      helper.went_wrong(res,err)
  }
}
exports.deleteAccount = async(req,res,next)=>{
   try{
   console.log(req.userData._id)
  
   let found = await userTable.findOne({'_id':req.userData._id})
   if(found){
     console.log(found)
     let deleteUser = await userTable.deleteOne({'_id':found._id})
     if(deleteUser){
       helper.success(res,"account deleted successfully")
     }
     else{
       console.log("server error")
        helper.db_errorwithoutE(res)
     }
   }else{
     console.log("not found already deleted")
     helper.not_found(res,"not found already deleted")
   }
    }
   catch(err){
     helper.went_wrong(res,err)
   }
}