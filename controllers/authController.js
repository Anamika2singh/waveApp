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
const ObjectId = mongoose.Types.ObjectId;

const userTable = require('../models/user');
const matchtable = require('../models/matching');
const { findOne, findByIdAndUpdate, findOneAndUpdate } = require('../models/user');

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
                             console.log(req.body.birthday)
                       let age = helper.getAge(req.body.birthday) //calling getage to calculate age 
                       console.log("your age is "+age)
                 let updateTable = await userTable.findByIdAndUpdate({'_id':found._id},{$set:
                             {
                                 age:age,
                                email_id:req.body.email_id,
                                password:bcrypt.hashSync(req.body.password,saltRounds),
                                first_name:req.body.first_name,
                                birthday:req.body.birthday,
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
  //  console.log(req.userData)
   let found = await userTable.findOne({'_id':req.userData._id})
  //  console.log("user who wants to fetch "+found)
   if(found){
           console.log("use filter"+found)
            //  console.log(found.gender_Interest)
             let gender_I = found.gender_Interest;
             let match_Arr = [];
    if(gender_I == 0){ // all user whose gender is female
let findmatches = await userTable.find({'gender':'female',
"age": { $gte: found.age_Rangestart, $lte:found.age_Rangend},
_id:{$ne:found._id}})
 if(findmatches.length>0){
              console.log(findmatches)
              match_Arr.push(findmatches)
              helper.success(res,"all matches",findmatches)
           }
           else{
            console.log('no matches found')
            helper.not_found(res,"no matches found")
           }
          }
         else if (gender_I == 1){// all user whose gender is male
 let findmatches = await userTable.find({'gender':'male',
 "age": { $gte: found.age_Rangestart, $lte:found.age_Rangend},
 _id:{$ne:found._id}})  
          if(findmatches.length>0){
                    console.log(findmatches)
                    match_Arr.push(findmatches)
                    // helper.success(res,"all matches",findmatches)
                 }
                 else{
                  console.log('no matches found')
                  helper.not_found(res,"no matches found")
                 }
         }
         else{//all user whose gender is male and female both
          let findmatches = await userTable.find({'gender':['male','female'],
          "age": { $gte: found.age_Rangestart, $lte:found.age_Rangend},
          _id:{$ne:found._id}})
          if(findmatches.length>0){
                    console.log(findmatches)
                    match_Arr.push(findmatches)
                    helper.success(res,"all matches",findmatches)
                 }
                 else{
                  console.log('no matches found')
                  helper.not_found(res,"no matches found")
                 }
         }
  
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
  // console.log(req.userData)
  let found = await userTable.findOne({'_id':req.userData._id})
  if(found){
    console.log(found)
    if(req.body.check_selfie == 1){ //user wants to update selfie
      console.log("to add pic")
          
         let  is_selfies = found.selfie.length
         console.log(is_selfies)
            if(is_selfies >0){//if some selfie already there in database then
                  //  console.log(is_selfies)
                  console.log("already in db"+is_selfies)
                  let len = is_selfies
                  let can_add = (5-len);
              if(len<5)
                 {
                    console.log("you can add")
                    let selfie_arr = []
                    for (let i = 0; i < req.files.length; i++) {
                     selfie_arr.push({
                         _id: ObjectId(),
                         selfie: req.files[i].filename
                           })
                      }
                     console.log(selfie_arr)
                   console.log("adding length"+selfie_arr.length)
                   let adding_len=selfie_arr.length;
                    if(adding_len > can_add){
                    console.log("you can add only"+can_add)
                    helper.went_wrongWithdata(res,"you can add only",can_add)
                    }
                     else{

         let final_arr= found.selfie.concat(selfie_arr)//using concat to join both the array of images
          console.log(final_arr)
    let updated_selfie = await userTable.findByIdAndUpdate({'_id':req.userData._id},{$set:{'selfie':final_arr}})   
               if(updated_selfie){
                  console.log("updated")
                  console.log(updated_selfie)
                  let found = await userTable.findOne({'_id':req.userData._id})
                 if(found){
                  helper.success(res,"selfies",found.selfie)
                 }
                else{
                  helper.not_found(res,"user not found")
                }
              
               }    
               else{
                 console.log("server errror");
                 helper.db_errorwithoutE(res)
               }        
                     }
                  }
            else{
              console.log("limit exceed first delete some")
            helper.login_failed(res,"limit exceed you can add only five ,first delete some selfies")
              }
                
            }
            else{ //first time adding selfie
                 
                   let selfie_arr = []
                   for (let i = 0; i < req.files.length; i++) {
                    selfie_arr.push({
                        _id: ObjectId(),
                        selfie: req.files[i].filename
                          })
                     }
                    console.log(selfie_arr)

                let update = await userTable.findByIdAndUpdate({'_id':req.userData._id},{$set:{selfie:selfie_arr}})
           if(update){
                 console.log(update)
                 let found = await userTable.findOne({'_id':req.userData._id})
                 if(found){
                  helper.success(res,"selfies",found.selfie)
                 }
                else{
                  helper.not_found(res,"user not found")
                }
             }
           else{
           helper.db_errorwithoutE(res)
              }      
              
            }

    }
    else {//user wants to fetch selfies when check_selfie = 0
      console.log(found.selfie)
    if(found.selfie.length >0){
         console.log("suces")
         console.log(found.selfie)
        helper.success(res,"selfies",found.selfie)
    }
       else{
         console.log(" not success")
          console.log(" first take some selfie")
        helper.not_found(res,"not found first take some selfie")
       }
       }
    
  }
  else{
    console.log("user not found")//user not found in table
    helper.not_found(res,"user not found")
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
    
     if(found){//if user found in th table
       if(req.body.check == 1){ //1 for update setting
      
       var arr = {};
 const its = ["gender_Interest","distance","age_Rangestart","age_Rangend","useCurrent_location", "new_Matches","messages","waves"];
       for (const iterator of its) {
        console.log(iterator)  
        if (req.body[iterator]) {
          arr[iterator] = req.body[iterator];
         }
        }
         console.log(arr);
         let update = await userTable.findByIdAndUpdate(
           { '_id':req.userData._id},
           { $set: arr }
         );
         if(update){ //if setting updated
            console.log("updated")
            userTable.findOne({'_id':req.userData._id},
            {gender_Interest:1,distance:1,age_Rangestart:1,age_Rangend:1,useCurrent_location:1,new_Matches:1,messages:1,waves:1},
            (err,updateData)=>{
                if(err) helper.went_wrong(res,err)
                else helper.success(res,"user setting updated successfully",updateData)
            })
         }else{//if setting can't update
           helper.db_errorwithoutE(res)
         }

    }
      else{ //o for fetch setting
         let usersetting = await userTable.findOne({'_id':req.userData._id},
         {distance:1,age_Rangestart:1,age_Rangend:1,useCurrent_location:1,new_Matches:1,messages:1,waves:1,gender_Interest:1})
          if(usersetting){
            console.log(usersetting)
            helper.success(res," default user setting",usersetting)
          }
          else{
            console.log("something went wrong!")
             helper.duplicate(res,"something went wrong!")
          }
      }
    }
  else{//if user not in the table
    console.log("user not exists")
    helper.not_found(res,"user not exists")
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
      //  if(data.device_type && data.device_token){
        let update = await userTable.findByIdAndUpdate({'_id':req.userData._id},{$set:{'device_type':'','device_token':''}})
          if(update){
            console.log("updated successfully")
        helper.success(res,"logout successfully")
          }
          else{
            console.log("server error")
            helper.db_errorwithoutE(res)
          }
        // }
    //        else{
    //       console.log("please enter device type and device token during register")
    //        helper.login_failed(res,"please login again fill device type and device token")
    // }
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
exports.deleteSelfie = async(req,res,next)=>{
  try{
  console.log(req.userData)
  let found = await userTable.findOne({'_id':req.userData._id})
  if(found){
    console.log(found)
    // console.log(found.selfie)
     
    const v = new Validator(req.body,{
      selfie_id:'required'
   })
   const matched = await v.check();
   let selfie_id=v.errors.selfie_id?v.errors.selfie_id.message:''

  if(!matched){
        let err=selfie_id
     helper.validation_error(res,err)
  }
   else{

    let images= found.selfie;
    let new_arr = []
    let already = 0;
    for(let img of images ){
      console.log(img._id)
      console.log(img.selfie)
       
  
      if(req.body.selfie_id == img._id){
        already = already+1;
           console.log("found equal"+img.selfie)
          
           let url = img.selfie;
        //    console.log(url);
        //  if(url.length == 0){
        //    console.log("already deleted no such file found")
          //  helper.not_found(res,"not found already deleted")
        
          // console.log("already val "+already);
        //  }
  //  else{
        // console.log("to delete")
        let dir='./public/images'
        // let url=img.selfie;
        fs.unlinkSync(dir+'/'+url)//deleting picture from folder
        console.log("deleted")
        // new_arr.push({
        //   _id : img._id,
        //   selfie: ''
        // })
      // }
      }
    else{
      new_arr.push({
        _id:img._id,
        selfie:img.selfie
      })
    }
    }
     
    
    // console.log("updated arr"+new_arr)
    // res.send(new_arr)
    if(already){

      console.log("checking 1")
       let update = await userTable.findByIdAndUpdate({'_id':req.userData._id},{$set:{selfie:new_arr}})
       if(update){
        let found = await userTable.findOne({'_id':req.userData._id})
        if(found){
          helper.success(res,"successfully deleted",found.selfie)
         }
        else{
          helper.not_found(res,"user not found")
        }
       }
       else{
        console.log("server errror");
        helper.db_errorwithoutE(res)
       }

  }
      else{
        // console.log("already deleted")
        // helper.not_found(res,"already deleted")
       console.log("already deleted")
      helper.not_found(res,"already deleted")

      }
  }
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
exports.matching = async(req,res,next)=>{
  try{
    const v = new Validator(req.body,{
      liked_userId:'required',
      like:'required|integer'
   })
   const matched = await v.check();
   let liked_userId=v.errors.liked_userId?v.errors.liked_userId.message:''
   let like=v.errors.like?v.errors.like.message:''
  if(!matched){
        let err=liked_userId+like
     helper.validation_error(res,err)
  }
   else{

    console.log(req.userData)
     let found = await userTable.findOne({'_id':req.userData._id})
     if(found){
     let set = await matchtable.create({
            user_Id:req.userData._id,
            liked_userId:req.body.liked_userId,
            like:req.body.like
      })
      if(set){
          console.log("saved data"+set.liked_userId)
          let likedDetails = await userTable.findOne({'_id':set.liked_userId})
          if(likedDetails){
            console.log(likedDetails)
          helper.success(res,"succesfully set status of like",likedDetails)
          }
          else{
            console.log("user not found")
            helper.not_found(res,"user not found")
          }
      }
      else{
        console.log("server error")
        helper.db_error(res,e)
      } 
     }
    else{
      console.log("not found in the db")
      helper.not_found(res,"not found in the db")
    }
  }
}
    catch(err){
      helper.went_wrong(res,err)
  }
}
exports.newMatches = async(req,res,next)=>{
  try{
    console.log("hii")
    console.log(req.userData._id)
    let logged_id = req.userData._id
    console.log(logged_id)
    let found = await userTable.findOne({'_id':req.userData._id})
    if(found){
      console.log(found)
      let alluser = await matchtable.find({liked_userId:req.userData._id,like:1},{user_Id:1,_id:0});
      
      if(alluser){
        console.log("all users who liked logged users"+alluser)//all users who liked logged users
      
      let user_Ids = alluser.map(arr=>arr['user_Id'])
      let all_newmatchesIDs = [];
      // console.log(user_Ids)
      for(user_Id of user_Ids){
        console.log("in loop"+user_Id)
         let result = await matchtable.aggregate([
           { "$match":{
               'user_Id': ObjectId(logged_id),
               'liked_userId': ObjectId(user_Id),
                'like':1
            } 
          },
          ])
          console.log("aggregate result"+result)
          result.forEach(async(element)=>{
            console.log("final user of all matches"+element.liked_userId)
            all_newmatchesIDs.push(element.liked_userId)
            // console.log("matches array"+all_newmatches)
          }) 
          console.log("matches array id "+all_newmatchesIDs)
      }
     
    let matcheduser_details =[]
    for(let all_newmatchesID of all_newmatchesIDs){
      console.log(all_newmatchesID)
      let user = await userTable.findOne({'_id':all_newmatchesID})//finding matched user details
      // {email_id:1,first_name:1,birthday:1,gender:1,profile:1,age:1,tittle:1,work:1,bio:1,education:1})
      if(user){
            matcheduser_details.push(user)
      }
      else{
        console.log("user not found")
        helper.not_found(res,"user not found")
      }
    }
      console.log("final res"+matcheduser_details)
      helper.success(res,"matched user",matcheduser_details)
    }
    else{
      console.log("not found")
      helper.not_found(res,"user not found")
    }
  }
  else{
    helper.not_found(res,"no user liked loggedIn user")
  }
  }
  catch(err){
    helper.went_wrong(res,err)
}
}