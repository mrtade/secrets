require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const encrypt = require('mongoose-encryption');

// express to use EJS
app.set('view engine', 'ejs');

// Express to use body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

//Express to use public dir
app.use(express.static("public"));

// require mongoose
const mongoose = require('mongoose');

// create new database
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// setup a schematic for collections
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// setup mongoose-encryption with a secret string
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// link User collections with model method to newly created schema
const User = new mongoose.model("User", userSchema);



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





app.post("/register", function(req, res){

  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res){

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){

    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });

});



/* Spin up server locally or via herokus process.env.PORT */

let port = process.env.PORT || 3000;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
