var express=require("express");
var bodyParser=require("body-parser");
  
const mongoose = require('mongoose');
const  ObjectId = require('mongodb').ObjectId;
const { request } = require("express");
mongoose.connect('mongodb+srv://Team2022:ddfgiks123@cluster0.0poxf.mongodb.net/gfg?retryWrites=true');
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})

var app=express()
var na="hello";
app.set('view engine','ejs');  
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));

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
    var Name = req.body.name;
    var pass = req.body.password;
    
    db.collection('details').find().toArray(function(err, items) {
            if(err) throw err;    
            for(let i=0;i<items.length;i++)
                {
                    if(items[i].name===Name){
                        if(items[i].password===pass)
                            {
                                console.log("valid account");
                            }
                        else{
                            console.log("invalid password");
                        }
                        
                    }
                    else{
                        console.log("invalid username")
                    }
                }
        });
    });

    app.get('/Admin_Customers', function(req, res) {
        
        console.log(na);
        db.collection('details').find().toArray(function(err, items) {
            if(err) throw err;    
           else{
                
                 res.render('Admin_Customers',{
                    user:items })
    
                }           
            });
      
    })
    app.get('/Admin_Counselors', function(req, res) {
        
        console.log(na);
        db.collection('details').find().toArray(function(err, items) {
            if(err) throw err;    
           else{
                
                 res.render('Admin_Counselors',{
                    user:items })
    
                }           
            });
      
    })
  
  
/*app.get('/',function(req,res){
res.set({
    'Access-control-Allow-Origin': '*'
    });
return res.redirect('registration.html');
}).listen(3000)*/
app.get('/', function(req, res) {
  
    res.render('index');
  }).listen(3000);
  app.get('/about', function(req, res) {
  
    res.render('about');
  });
  app.post('/Admin_Customers', function(req, res) {
    var id=req.body.id;
    console.log(id);
    var name = req.body.name;
    var email =req.body.email;
    var pass = req.body.password;
    var phone =req.body.phone;
    var organization = req.body.organization;
    var aadhar=req.body.aadhar;
    var address = req.body.address;
    var country = req.body.country;
    var pincode = req.body.pincode;
    var role = req.body.role;
    res.render('update',{
        id:id,
        name:name,
        email:email,
        pass:pass,
        phone:phone,
        organization:organization,
        aadharNum:aadhar,
        address:address,
        country:country,
        pincode:pincode,
        role:role
    });
  });
  /*app.get('/update', function(req, res) {
     console.log(na);
    res.render('update',{
        name:"hello"
    });
  });*/
  app.get('/registration', function(req, res) {
    
    res.render('registration');
  });
  app.get('/login', function(req, res) {
  
    res.render('login');
  });
  app.get('/registration', function(req, res) {
  
    res.render('registration');
  });
  app.post('/update', function(req, res) {
    var data={
     name : req.body.name,
     email:req.body.email,
     phone:req.body.phone,
     aadharNum:req.body.aadharNum,
     address : req.body.address,
     country :req.body.country,
    }  
    var id=req.body.id;
    db.collection('details').updateOne({"_id": ObjectId(id)},{$set:data},function(err, collection){
        if (err) throw err;
        console.log("Record updated Successfully");
              
    });
     
  });
 
  app.post('/delete', function(req, res) {
    
    var id=req.body.id;
    console.log(id)
    db.collection('details').deleteOne({"_id": ObjectId(id)},function(err, collection){
        if (err) throw err;
        console.log("Record deleted Successfully");
              
    });
     
  });

  
  
console.log("server listening at port 3000");
