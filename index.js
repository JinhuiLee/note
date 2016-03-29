
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var crypto = require("crypto");

var app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
  res.render('index',{
    title: 'FrontPage'
  });
});

app.get('/register',function(req,res){
  console.log('注册');
  res.render('register',{
    title:'注册'
  });
});

app.get('/login',function(req,res){
  console.log('登录');
  res.render('login',{
    title:'登录'
  });
});

app.get('/quit',function(req,res){
  console.log('登录');
  return res.redirect('/login');
});

app.get('/post',function(req,res){
  console.log('发布');
  res.render('post',{
    title:'发布'  
  });
});

app.get('/detail',function(req,res){
  console.log('查看笔记')
  res.render('detail',{
    title:'查看笔记'
  });
});

app.listen(3000,function(req,res){
  console.log('app is running at port 3000');
});
