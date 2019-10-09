/* THE ORDER OF THE PASSPORT-EXPRESS-SESSION-MONGOOSE CODE IS VITAL FOR THIS TO WORK*/

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// require mongoose
const mongoose = require('mongoose');

const app = express();
//Express to use public dir
app.use(express.static("public"));
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// express to use EJS
app.set('view engine', 'ejs');

// Express to use body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// create new database
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

mongoose.set('useCreateIndex', true);

// setup a schematic for collections
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
// setup mongoose-encryption with a secret string
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// link User collections with model method to newly created schema
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ACTIONS */

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

  // bcrypt.hash(req.body.password, 10, function(err, hash){
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //
  //   newUser.save(function(err){
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   });
  //
  // });

});

app.post("/login", function(req, res){

  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
  });

  // const username = req.body.username;
  // // const password = md5(req.body.password);
  // const password = req.body.password;
  //
  // User.findOne({email: username}, function(err, foundUser){
  //
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         if (result === true){
  //           res.render("secrets");
  //         }
  //
  //       });
  //     }
  //   }
  // });

});



/* Spin up server locally or via herokus process.env.PORT */

let port = process.env.PORT || 3000;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
