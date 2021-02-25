const express = require('express');
const router = express.Router();
const multer= require('multer');
const authController = require('../controllers/authController');
const middlewaretoken = require('../middlewares/tokenVerify');


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

router.post('/register',upload.single('profile'),authController.register);
// router.post('/register',authController.register);
router.post('/login',authController.login)
router.post('/loginPhone',authController.loginPhone)
router.post('/addNumber',authController.number)
router.post('/otpVerify',authController.otpVerify)

router.get('/getuserProfile',middlewaretoken,authController.getuserProfile)
router.post('/editProfile',middlewaretoken,upload.single('profile'),authController.editProfile)
router.post('/selfiebook',middlewaretoken,upload.array('selfie',5),authController.selfiebook)
router.get('/matches',middlewaretoken,authController.matches)
router.post('/Setting',middlewaretoken,authController.Setting)
router.get('/logout',middlewaretoken,authController.logout)
router.get('/deleteAccount',middlewaretoken,authController.deleteAccount)
router.post('/deleteSelfie',middlewaretoken,authController.deleteSelfie)
router.post('/matching',middlewaretoken,authController.matching)
router.get('/newMatches',middlewaretoken,authController.newMatches)
module.exports = router;