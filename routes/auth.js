const express = require('express');
const router = express.Router();
const multer= require('multer');
const authController = require('../controllers/authController');



var storage =  multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/images')
    },
    filename : function(req,file,cb){
        cb(null,  Date.now()+file.originalname )
    }
}) 
const upload= multer({
    storage :storage
})
router.use('/picture',express.static('upload'));
router.post('/register',upload.single('profile'),authController.register);
// router.post('/register',authController.register);
router.post('/login',authController.login)
router.post('/addNumber',authController.number)
router.post('/otpVerify',authController.otpVerify)



module.exports = router;