var express=require("express");
var bodyParser=require("body-parser");
  
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true&w=majority');
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})
  
var app=express()
  
  
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
  
app.post('/register', function(req,res){
    var name = req.body.name;
    var email =req.body.email;
    var pass = req.body.password;
    var phone =req.body.phone;
    var organization = req.body.organization;
    var aadharNum=req.body.aadharNum;
    var address = req.body.address;
    var country = req.body.country;
    var pincode = req.body.pincode;
    var role = req.body.role;
  
    var data = {
        "name": name,
        "email":email,
        "organization" :organization,
        "address" : address,
        "country" : country,
        "pincode" : pincode,
        "aadharNum" : aadharNum,
        "role" : role,
        "password":pass,
        "phone":phone
    }

    console.log(name + email + pass + phone);
db.collection('details').insertOne(data,function(err, collection){
        if (err) throw err;
        console.log("Record inserted Successfully");
              
    });
          
    return res.redirect('login.html');
})
app.post('/login',function(req,res){
    console.log("hello");
    var email = req.body.email;
    var pass = req.body.password;

    
    db.collection('details').find().toArray(function(err, items) {
            if(err) throw err;    
            for(let i=0;i<items.length;i++)
                {
                    console.log(email + pass);
                    if(items[i].email === email && items[i].password === pass){
                       console.log("Valid account");
                       if( items[i].role == "admin") {
                        return res.redirect('admin/Admin_Dashboard.html');
                       }
                       else if(items[i].role == "counselor") {
                           //return res.redirect('');
                           //return alert("Counselor Access");
                       }
                       else {
                           //return alert("Customer access");
                       }
                    }
                    else{
                        console.log("Invalid credentials");
                        //return alert("Invalid");
                        return res.redirect('login.html');
                    }
                }
                        
        });
    });


  
  
app.get('/',function(req,res){
res.set({
    'Access-control-Allow-Origin': '*'
    });
return res.redirect('registration.html');
}).listen(3000)
  
  
console.log("server listening at port 3000");
