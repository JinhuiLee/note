
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var crypto = require("crypto");

var mongoose = require("mongoose");
var models = require("./models/models.js");

var User = models.User;

mongoose.connect("mongodb://localhost:27017/notes");
mongoose.connection.on('error', console.error.bind(console,"数据库连接失败"));

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

app.post('/register',function(req,res){
  var username = req.body.username, password=req.body.password, passwordRepeat=req.body.passwordRepeat;  if ( username.trim().length == 0 ){
    console.log("用户名不能为空");
    return res.redirect('/register');
  }
  
  if ( password.trim().length == 0 || passwordRepeat.trim().length == 0 ){
    console.log("密码不能为空");
    return res.redirect('/register');
  }
 
  if ( password!=passwordRepeat ){
    console.log("两次输入密码不一致");
    return res.redirect('/register');
  }
  
  User.findOne({username:username},function(err, user){
    if (err){
      console.log(err);
      return res.redirect('/register');
    }

    if (user){
      console.log("用户名已经存在");
      return res.redirect('/register');
    }

    var md5 = crypto.createHash("md5");
    var md5Pass = md5.update(password).digest('hex');

    var newUser= new User({
      username : username,
      password : md5Pass
    });


    newUser.save(function(err,doc){
      if (err){
        console.log(err);
        return res.redirect('/register');
      }
      console.log('注册成功');
      return res.redirect('/');
      
    });
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
