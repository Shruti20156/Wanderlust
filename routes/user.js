const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const usercontroller=require("../controllers/user");

router.route("/signup")
.get(usercontroller.rendersignup)
.post(usercontroller.signup);

router.route("/login")
.get(usercontroller.renderlogin)
.post(passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password"
}), usercontroller.login);

router.get("/logout", usercontroller.logout);

module.exports = router;