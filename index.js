const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDbSession = require("connect-mongodb-session")(session);
const alert = require("alert");

const bcrypt = require("bcrypt");

const app = express();

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const UserModel = require("./models/User");
const BookingModel = require("./models/Bookings");

const mongoUri =
  "mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true";

const { request } = require("express");
mongoose.connect(
  "mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true"
);
const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("MongoDb connection succeeded");
});

const store = new MongoDbSession({
  uri: mongoUri,
  collection: "mySesionUsers",
});

app.use(
  session({
    secret: "key to sign cookies",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var currentUser;
var na = "hello";

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};


// Register
app.post("/registration", async (req, res) => {
  console.log("registraing status");
  const {
    name,
    email,
    password,
    phone,
    organization,
    aadharNum,
    address,
    country,
    pincode,
    role,
  } = req.body;

  let user = await UserModel.findOne({ email });

  if (user) {
    //
    console.log("user with Emaild id exists");
    return res.redirect("/registration");
  }

  const hashedPass = await bcrypt.hash(password, 12);

  // console.log(name + email+password+phone+organization+aadharNum+ address+country+pincode+role);

  user = new UserModel({
    name,
    email,
    password: hashedPass,
    phone,
    organization,
    aadharNum,
    address,
    country,
    pincode,
    role,
  });
  await user.save();

  return res.redirect("login");
});

app.get("/registration", function (req, res) {
  const error = req.session.error;
  delete req.session.error;
  res.render("registration", { err: error });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/index");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    req.session.error = "User not found";
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.redirect("/login");
  }

  console.log("logging in user: " + email);

  req.session.isAuth = true;
  req.session.username = user.name;
  req.session.emailId = user.email;
  req.session.role = user.role;

  if (req.session.isAuth) {
    if (user.role === "admin") {
      console.log("admin access");
      return res.redirect("/Admin_Dashboard");
    } else if (user.role === "user") {
      console.log("customer access");
      return res.redirect("/Customer_Dashboard");
    } else {
      console.log("counselor access");
      return res.redirect("/Counselor_Dashboard");
    }
  }
});

app.get("/login", function (req, res) {
  const error = req.session.error;
  delete req.session.error;
  res.render("login", { err: error });
});

app.post("/logout", function (req, res) {
  console.log("Loggin out");
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

app.get("/Admin_Customers", isAuth, function (req, res) {
  console.log(na);
  db.collection("users")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      else {
        res.render("Admin_Customers", {
          user: items,
        });
      }
    });
});
app.get("/Admin_Counselors", isAuth, async (req, res) => {
  console.log(na);
  db.collection("users")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      else {
        res.render("Admin_Counselors", {
          user: items,
        });
      }
    });
});

//Customer Operations
app.get("/Customer_Dashboard", isAuth, async (req, res) => {
  let email = req.session.emailId;

  let user = await UserModel.findOne({ email });
  console.log("***********" + user._id);

  var noOfCounselors = 0;
  var noOfUsers = 0;
  var noOfBookings = 0;
  db.collection("details")
    .find()
    .toArray(function (err, items) {
      for (var i = 0; i < items.length; i++) {
        console.log(items[i].role);

        if (items[i].role === "counselor" || items[i].role === "Counselor") {
          console.log("if condditon");
          noOfCounselors = noOfCounselors + 1;
        }
        if (items[i].role === "user" || items[i].role === "User") {
          noOfUsers = noOfUsers + 1;
        }
      }
      db.collection("bookings")
        .find()
        .toArray(function (err, elements) {
          console.log(elements.length);
          noOfBookings = elements.length;
          console.log(noOfBookings);
          res.render("Customer_Dashboard", {
            id: user._id,
            name: user.name,

            email: user.email,

            phone: user.phone,
            auth:true,
            role: user.role,
            NoOfCounselors: noOfCounselors,
            NoOfUsers: noOfUsers,
            NoOfBookings: noOfBookings,
          });
        });
    });
});

app.get("/Customer_Profile", isAuth, async (req, res) => {
  let email = req.session.emailId;
  let user = await UserModel.findOne({ email });

  // var session = req.session.username;
  res.render("Customer_Profile", {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
});

app.post("/update_customer", isAuth, async (req, res) => {
  let email = req.session.emailId;
  let user = await UserModel.findOne({ email });

  const password = req.body.updatedPassword;
  const phone = req.body.phone;

  const hashedPass = await bcrypt.hash(password, 12);

  user.phone = phone;
  user.password = hashedPass;
  user.save();
  console.log("Changes are done");
  alert("Changes are done");

  res.redirect("/Customer_Profile");
});

app.get("/Customer_Session", isAuth, async (req, res) => {
  if (req.session.role === "user") {
    let email = req.session.emailId;

    BookingModel.find({ user_email: email }, function (err, docs) {
      console.log(docs);
      res.render("Customer_Session", { booking: docs });
    });
  } else {
    console.log("Logging out since not a customer");

    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/login");
    });
  }
});

app.post("/Customer_Counselor", async (req, res) => {
  const { counselor_email, counselour_name, date, time } = req.body;

  let email = req.session.emailId;

  let user = UserModel.find({ email });
  // console.log(email);

  //console.log(date + time + " " + id);

  bookings = new BookingModel({
    user_email: email,
    counselor_email,
    date,
    time,
    status: "processing",
    counselour_name,
  });
  // console.log(bookings);
  await bookings.save();
  alert("Appointed Booked");
  res.redirect("/Customer_Counselor");
});

app.post("/Admin_Customers", function (req, res) {
  var id = req.body.id;
  console.log(id);
  var name = req.body.name;
  var email = req.body.email;
  var pass = req.body.password;
  var phone = req.body.phone;
  var organization = req.body.organization;
  var aadhar = req.body.aadhar;
  var address = req.body.address;
  var country = req.body.country;
  var pincode = req.body.pincode;
  var role = req.body.role;
  res.render("update", {
    id: id,
    name: name,
    email: email,
    pass: pass,
    phone: phone,
    organization: organization,
    aadharNum: aadhar,
    address: address,
    country: country,
    pincode: pincode,
    role: role,
  });
});

app.get("/Counselor_Dashboard", isAuth, async (req, res) => {
  let email = req.session.emailId;

  let user = await UserModel.findOne({ email });
  console.log("***********" + user._id);

  var noOfCounselors = 0;
  var noOfUsers = 0;
  var noOfBookings = 0;
  db.collection("users")
    .find()
    .toArray(function (err, items) {
      for (var i = 0; i < items.length; i++) {
        console.log(items[i].role);

        if (items[i].role === "counselor" || items[i].role === "Counselor") {
          console.log("if condditon");
          noOfCounselors = noOfCounselors + 1;
        }
        if (items[i].role === "user" || items[i].role === "User") {
          noOfUsers = noOfUsers + 1;
        }
      }
      db.collection("bookings")
        .find()
        .toArray(function (err, elements) {
          console.log(elements.length);
          noOfBookings = elements.length;
          console.log(noOfBookings);
          res.render("Counselor_Dashboard", {
            id: user._id,
            name: user.name,

            email: user.email,
            auth:true,
            phone: user.phone,
            auth:req.session.isAuth,
            role: user.role,
            NoOfCounselors: noOfCounselors,
            NoOfUsers: noOfUsers,
            NoOfBookings: noOfBookings,
          });
        });
    });
});

app.get("/head2", async (req, res) => {
  let email = req.session.emailId;
  if (isAuth) {
    console.log("-------------------------------------------in Auth");
    let user = await UserModel.findOne({ email });
    console.log("***********" + user._id);
    res.render("head2", {
      id: user._id,

      name: user.name,

      email: user.email,

      phone: user.phone,

      role: user.role,
    });
  } else {
    res.render("index", { role: "", id: "" });
  }
});

app.get("/Customer_Counselor", async (req, res) => {
  UserModel.find({ role: "counselor" }, function (err, docs) {
    if (err) {
      console.log("no records found or error");
    }
    console.log(docs);
    res.render("Customer_Counselor", { user: docs });
  });
});

//Counselor Operations
app.get("/Counselor_Customer", function (req, res) {
  if (req.session.role === "counselor") {
    let email = req.session.emailId;

    BookingModel.find(
      { counselor_email: email, status: "processing" },
      function (err, docs) {
        //console.log(docs);
        res.render("Counselor_Customer", { booking: docs });
      }
    );
  } else {
    console.log("Logging out since not a counselor");

    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/login");
    });
  }
});

app.post("/Counselor_Customer_Accept", async (req, res) => {
  var id = req.body.id;

  // console.log(id);
  await BookingModel.updateOne(
    { _id: ObjectId(id) },
    { $set: { status: "accepted" } }
  );
  res.redirect("Counselor_Customer");
});

app.post("/Counselor_Customer_Decline", async (req, res) => {
  var id = req.body.id;
  //console.log(id)

  await BookingModel.updateOne(
    { _id: ObjectId(id) },
    { $set: { status: "declined" } }
  );
  res.redirect("Counselor_Customer");
});

app.get("/Counselor_Session", async (req, res) => {
  res.redirect("/Counselor_Session");
});

app.get("/Counselor_Profile", isAuth, async (req, res) => {
  let email = req.session.emailId;

  let user = await UserModel.findOne({ email });

  res.render("Counselor_Profile", {
    id: user._id,

    name: user.name,

    email: user.email,

    phone: user.phone,
  });
});

app.post("/update_counselor", isAuth, async (req, res) => {
  let email = req.session.emailId;

  let user = await UserModel.findOne({ email });

  const password = req.body.updatedPassword;
  const phone = req.body.phone;
  const hashedPass = await bcrypt.hash(password, 12);

  user.phone = phone;
  user.password = hashedPass;
  user.save();
  console.log("Changes are done");
  alert("Changes are done");
  res.redirect("/Counselor_Profile");
});

// >>>>>>> sprint-3
app.get("/Admin_Session", function (req, res) {
  var data = [];

  db.collection("users")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      else {
        db.collection("bookings")
          .find()
          .toArray(function (err, elements) {
            for (var i = 0; i < elements.length; i++) {
              console.log("hello");
              data.push({
                date: elements[i].date,
                time: elements[i].time,
                user_id: elements[i].user_email,
                counselor_id: elements[i].counselor_email,
                status: elements[i].status,
              });
            }
            console.log(data);
            res.render("Admin_Session", {
              booking: data,
            });
          });
      }
    });
});

app.get("/Counselor_Customer", function (req, res) {
  res.render("Counselor_Customer");
});

app.get("/Customer_Dashboard", function (req, res) {
  res.render("Customer_Dashboard");
});

// app.get('/Customer_Profile', function(req, res) {
//     res.render('Customer_Profile');
// });

app.get("/Admin_Dashboard", isAuth, async (req, res) => {
  let email = req.session.emailId;

  let user = await UserModel.findOne({ email });
  console.log("***********" + user._id);
  db.collection("users")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      else {
        db.collection("bookings")
          .find()
          .toArray(function (err, elements) {
            res.render("Admin_Dashboard", {
              id: user._id,
              name: user.name,

              email: user.email,
              auth:true,
              phone: user.phone,

              role: user.role,
              user: items,
              bookings: elements,
            });
          });
      }
    });
});

app.post("/update", function (req, res) {
  var data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    aadharNum: req.body.aadharNum,
    address: req.body.address,
    country: req.body.country,
  };
  var id = req.body.id;
  db.collection("details").updateOne(
    { _id: ObjectId(id) },
    { $set: data },
    function (err, collection) {
      if (err) throw err;
      console.log("Record updated Successfully");
    }
  );
});

app.post("/delete", function (req, res) {
  var id = req.body.id;
  console.log(id);
  db.collection("users").deleteOne(
    { _id: ObjectId(id) },
    function (err, collection) {
      if (err) throw err;
      console.log("Record deleted Successfully");
      res.redirect("Admin_Customers");
    }
  );
});
app.post("/deletecounselors", function (req, res) {
  console.log("deletecounselor");
  var id = req.body.id;
  console.log(id);
  db.collection("users").deleteOne(
    { _id: ObjectId(id) },
    function (err, collection) {
      if (err) throw err;
      console.log("Record deleted Successfully");
      res.redirect("Admin_Counselors");
    }
  );
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/Contact", function (req, res) {
    var auth= false
    if(req.session.isAuth){
        auth=true;
    }
  res.render("Contact",{'auth':auth});
});

app.get("/index", async (req, res) => {
  if (req.session.isAuth) {
    console.log("====================autho");
    let email = req.session.emailId;

    let user = await UserModel.findOne({ email });
    console.log("***********" + user._id);
    res.render("index", {
      id: user._id,
      name: user.name,

      email: user.email,

      phone: user.phone,
        auth:true,
      role: user.role,
    });
  } else {
    res.render("index", { auth:false, role: "", id: "" });
  }

  // req.session.isAuth = true;
  // console.log(req.session);
  // console.log(req.session.id)
});

app.get("/", function (req, res) {
  // req.session.isAuth = true;
  // console.log(req.session);
  // console.log(req.session.id)
  res.render("index");
});

app.listen(3000, console.log("Server Running on http://localhost:3000"));
