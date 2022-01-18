const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);
const alert = require('alert');

const bcrypt = require('bcrypt');

const app = express()

const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const UserModel = require("./models/User");
const mongoUri = "mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true";

const { request } = require("express");
mongoose.connect('mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true');
const db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("MongoDb connection succeeded");
})


const store = new MongoDbSession({
    uri: mongoUri,
    collection: "mySesionUsers"
})

app.use(session( {
    secret: 'key to sign cookies',
    resave: false,
    saveUninitialized: false,
    store: store
}));



app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var currentUser;
var na = "hello";

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect("/login");
    }

}


// Register 
app.post('/registration', async (req, res)=> {

    console.log("registraing status");
    const {name, email, password, phone, organization,aadharNum, address, country, pincode, role} = req.body;


    let user = await UserModel.findOne({email});

    if (user) {
        // 
        console.log("user with Emaild id exists");
        return res.redirect('/registration');
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
    })
    await user.save();

    return res.redirect('login');
});

app.get('/registration', function (req, res) {
    const error = req.session.error;
    delete req.session.error;
    res.render('registration', {err: error});
});



app.post('/login', async (req, res) => {
    console.log("logging in");

    const { email, password} = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        req.session.error = "User not found";
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.session.error("Invalid credentialss");
        return res.redirect('/login');
    }

    req.session.isAuth = true;
    req.session.username = user.name;
    req.session.emailId = user.email;
    req.session.role =  user.role;

    if(req.session.isAuth){
        if (user.role === "admin"){
        
            return res.redirect("/Admin_Dashboard");
        }
        else if (user.role === "customer") {
            return res.redirect("/Customer_Dashboard"); 
        }
        else{
            return res.redirect("/Counselor_Dashboard");
        }
    }
    

    
    
});

app.get('/login', function (req, res) {
    const error = req.session.error;
    delete req.session.error;
    res.render('login', {err: error});
});

app.post('/logout', function(req, res) {
    console.log("Loggin out");
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/login');
    });
});



app.get('/Admin_Customers', isAuth,function (req, res) {

    console.log(na);
    db.collection('details').find().toArray(function (err, items) {
        if (err) throw err;
        else {

            res.render('Admin_Customers', {
                user: items
            })

        }
    });

})
app.get('/Admin_Counselors', function (req, res) {

    console.log(na);
    db.collection('details').find().toArray(function (err, items) {
        if (err) throw err;
        else {

            res.render('Admin_Counselors', {
                user: items
            })

        }
    });

})





//Customer Operations

app.get('/Customer_Profile', isAuth, async (req, res) => {

    let email = req.session.emailId;
    let user = await UserModel.findOne({email});

    // var session = req.session.username;
    res.render('Customer_Profile', {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
    });
});


app.post('/update_customer', isAuth, async (req, res) => {
    

    let email = req.session.emailId;
    let user =  await UserModel.findOne({email});

    const password = req.body.updatedPassword;
    const phone = req.body.phone;

    const hashedPass = await bcrypt.hash(password, 12);



    user.phone = phone;
    user.password = hashedPass;
    user.save();
    console.log("Changes are done");
    alert("Changes are done");

    res.redirect('/Customer_Profile');



});

app.post('/Customer_Counselor', function (req, res) {
    var date = req.body.date;
    var time = req.body.time;
    var counselorID=req.body.id;
    var userID=currentUser;
   

    var data = {
        "user_id":userID,
        "counselor_id":counselorID,
        "date": date,
        "time": time,   
    }
    console.log(counselorID);
    
    db.collection('bookings').insertOne(data, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
        db.collection('details').find().toArray(function (err, items) {
        if (err) throw err;
        else {

            res.render('Customer_Counselor', {
                user: items
            })

        }
    });
    });

    
});

app.post('/Admin_Customers', function (req, res) {
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
    res.render('update', {
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
        role: role
    });
});




app.get('/Customer_Counselor', function (req, res) {
    
    db.collection('details').find().toArray(function (err, items) {
        if (err) throw err;
        else {

            res.render('Customer_Counselor', {
                user: items
            })

        }
    });
});


app.get('/Admin_Session', function(req, res) {
    var data=[];

  db.collection('details').find().toArray(function(err, items) {
      if(err) throw err;    
     else{

      db.collection('bookings').find().toArray(function(err, elements) {
            for(var i=0;i<elements.length;i++)
            {   
              for(var j=0;j<items.length;j++){
                  console.log(ObjectId(elements[i].counselor_id))
                  console.log(String(items[j]._id))
                  if((elements[i].counselor_id)===String(items[j]._id))
                  {
                      console.log("hello");
                      data.push({date:elements[i].date,
                          time:elements[i].time,
                          user_id:elements[i].user_id,
                          counselor_id:elements[i].counselor_id,
                          counselor_name:items[j].name})
                          }
              }
                
            }
            console.log(data)
           res.render('Admin_Session',{
              booking:data
              })

          })          
      }})
});

app.get('/Customer_Dashboard', function (req, res) {
    res.render('Customer_Dashboard');
});

// app.get('/Customer_Profile', function(req, res) {
//     res.render('Customer_Profile');
// });



app.get('/Admin_Dashboard', isAuth, (req, res) => {
  
    db.collection('details').find().toArray(function(err, items) {
        if(err) throw err;    
       else{

        db.collection('bookings').find().toArray(function(err, elements) {
             res.render('Admin_Dashboard',{
                user:items,
                bookings:elements})

            })          
        }})

  });


app.post('/update', function (req, res) {
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        aadharNum: req.body.aadharNum,
        address: req.body.address,
        country: req.body.country,
    }
    var id = req.body.id;
    db.collection('details').updateOne({ "_id": ObjectId(id) }, { $set: data }, function (err, collection) {
        if (err) throw err;
        console.log("Record updated Successfully");

    });

});



app.post('/delete', function (req, res) {

    var id = req.body.id;
    console.log(id)
    db.collection('details').deleteOne({ "_id": ObjectId(id) }, function (err, collection) {
        if (err) throw err;
        console.log("Record deleted Successfully");

    });

});



app.get('/about', function (req, res) {

    res.render('about');
});




app.get('/', function( req, res) {

   

    // req.session.isAuth = true;
    // console.log(req.session);
    // console.log(req.session.id)
    res.render('index');
});

app.listen(3000, console.log("Server Running on http://localhost:3000"));