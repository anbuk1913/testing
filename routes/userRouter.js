const express = require("express")
const userController = require("../controller/userController")
const userAuth = require('../middleware/userAuth');
const shopController = require('../controller/shopController')
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const profileController = require("../controller/profileController")
const checkoutController = require("../controller/checkoutController")
const orderController = require('../controller/orderController')
const router = express.Router()
const passport = require('passport');

//Landing Page & Authentication
router.get("/",userController.homePage)
router.get("/login",userController.loginPage)
router.post("/login",userController.loginPost)
router.get("/signup",userController.signUpPage)
router.post("/signup",userController.signUpPost)
router.get("/otpsend",userController.otpSend)
router.get("/otp",userController.otpPage)
router.post("/otp",userController.otpPost)
router.get('/auth/google', passport.authenticate('google',{scope:['email','profile']}))
router.get('/auth/google/callback', passport.authenticate('google',{failureRedirect:'http://localhost:3000/login'}),userController.googleCallback)
router.get("/blocked",userController.blockedUser)
router.post("/logout",userController.logout)

//Shop & Cart
router.get('/shop',shopController.shopPage)
router.get('/product/:id',productController.singleProductView)
router.get("/cart",userAuth,cartController.cartView)
router.post("/addcart",userAuth,cartController.addtoCart)
router.delete("/removeitem",userAuth,cartController.removeItem)
router.patch("/updatecart",userAuth,cartController.updateCartItems)

//Profile
router.get("/profile",userAuth,profileController.profile)
router.get("/address",userAuth,profileController.addressPage)
router.get("/addaddress",userAuth,profileController.addAddress)
router.post("/addaddress",userAuth,profileController.addAddressPost)
router.get("/editaddress/:id",userAuth,profileController.editAddress)
router.put("/editaddress",userAuth,profileController.editAddressPut)
router.delete("/deleteaddress/:id",userAuth,profileController.deleteAddress)
router.get("/changepassword",userAuth,profileController.changePassword)
router.patch("/changepassword",userAuth,profileController.changePasswordPatch)
router.patch("/edituserdata",userAuth,profileController.editUserData)
router.get("/orders",userAuth,orderController.userOrder)
router.get('/orderview/:id',userAuth,orderController.userOrderView)
router.patch('/cancelorder',userAuth,orderController.cancelOrder)
router.patch('/returnorder',userAuth,orderController.returnOrder)

// Checkout Pages
router.get("/checkoutaddress",userAuth,checkoutController.checkoutPageOne)
router.post("/checkouttwo",userAuth,checkoutController.checkoutTwoPost)
router.get("/billing",userAuth,checkoutController.billingPage)
router.post("/billing",userAuth,checkoutController.billingMethodPost)
router.get("/payment",userAuth,checkoutController.paymentPage)
router.post("/paymethod",userAuth,checkoutController.paymentMethod)
router.get("/review",userAuth,checkoutController.finalReview)
router.patch("/finalstockcheck",userAuth,checkoutController.finalQuantityCheck)
router.post("/orderproduct",userAuth,checkoutController.orderPost)
router.get("/confirm",userAuth,checkoutController.confirmPage)


module.exports = router