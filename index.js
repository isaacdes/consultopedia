var express = require("express");
var bodyParser = require("body-parser");

const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const { request } = require("express");
mongoose.connect('mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

var app = express()
var na = "hello";
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));

app.use(bodyParser.urlencoded({
    extended: true
}));
var currentUser;
app.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pass = req.body.password;
    var phone = req.body.phone;
    var organization = req.body.organization;
    var aadharNum = req.body.aadharNum;
    var address = req.body.address;
    var country = req.body.country;
    var pincode = req.body.pincode;
    var role = req.body.role;

    var data = {
        "name": name,
        "email": email,
        "organization": organization,
        "address": address,
        "country": country,
        "pincode": pincode,
        "aadharNum": aadharNum,
        "role": role,
        "password": pass,
        "phone": phone
    }

    console.log(name + email + pass + phone);
    db.collection('details').insertOne(data, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");

    });

    return res.redirect('login.html');
})


app.post('/login', function (req, res) {
    console.log("hello");
    var Name = req.body.name;
    var pass = req.body.password;

    db.collection('details').find().toArray(function (err, items) {
        if (err) throw err;
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === Name) {
                if (items[i].password === pass) {
                    console.log("valid account");
                    currentUser=String(items[i]._id);
                    var Id =items[i]._id;
                    var User=items[i].name;
                    var Email=items[i].email;
                    var Pass = items[i].password;
                    var Phone = items[i].phone;
                    res.render('Customer_Profile', {
                        id:Id,
                        user: User,
                        email:Email,
                        pass:Pass,
                        phone:Phone
                    })
                }
                else {
                    console.log("invalid password");
                }

            }
            else {
                console.log("invalid username")
            }
        }
    });
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

    
})

app.get('/Admin_Customers', function (req, res) {

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


/*app.get('/',function(req,res){
res.set({
    'Access-control-Allow-Origin': '*'
    });
return res.redirect('registration.html');
}).listen(3000)*/
app.get('/', function (req, res) {

    res.render('index');
}).listen(3000);
app.get('/about', function (req, res) {

    res.render('about');
});
app.post('/Customer_Profile', function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var pass = req.body.pass;
    res.render('update_customer', {
        id: id,
        name: name,
        email: email,
        pass: pass,
        phone: phone
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
/*app.get('/update', function(req, res) {
   console.log(na);
  res.render('update',{
      name:"hello"
  });
});*/
app.get('/registration', function (req, res) {

    res.render('registration');
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
app.get('/login', function (req, res) {

    res.render('login');
});
app.get('/registration', function (req, res) {

    res.render('registration');
});
app.get('/Admin_Dashboard', function(req, res) {
  
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
app.post('/update_customer', function (req, res) {
    
    var data = {

        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.pass,
        
    }
    
    var id = req.body.id;
    console.log("id",id);
    db.collection('details').updateOne({ "_id": ObjectId(id) }, { $set: data }, function (err, collection) {
        if (err) throw err;
        console.log("Record updated Successfully");
        res.render('Customer_Profile', {
            id:id,
            user:data['name'],
            email:data['email'],
            pass:data['password'],
            phone:data['phone']
        })

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



console.log("server listening at port 3000");
