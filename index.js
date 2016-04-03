
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var crypto = require("crypto");
var session= require("express-session");
var moment = require("moment");

var mongoose = require("mongoose");
var models = require("./models/models.js");
var checkLogin = require('./checkLogin.js'); 

var User = models.User;
var Note = models.Note;
mongoose.connect("mongodb://localhost:27017/notes");
mongoose.connection.on('error', console.error.bind(console,"数据库连接失败"));

var app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: '1234',
  name: 'munote',
  cookie: {maxAge: 100*60*20},
  resave: false,
  saveUninitialized: true
}));

// number of items per page
nitems=5


app.get('/',checkLogin.noLogin);
app.get('/',function(req,res){
  return res.redirect('/start/1');
});



app.get('/start/:curr',checkLogin.noLogin);
app.get('/start/:curr',function(req,res){
  Note.find({author: req.session.user.username})
    .exec(function(err,allNotes){
      if (err) {
        console.log(err);
        return res.redirect('/');
      } 
      
      var error=req.session.error;
      req.session.error="";
      
     
      var number=allNotes.length;
      var curr=parseInt(req.params.curr);
      var prev=curr>nitems? curr-nitems: 1;
      var next=(curr+nitems>number)?curr:curr+nitems;


      res.render('index',{
        user: req.session.user,
        title: '首页·',
        notes: allNotes.slice(curr-1,curr-1+nitems),
        error: error,
        number: number,
        nitems: nitems,
        curr: curr,
        prev: prev,
        next: next,
        moment: moment
      });
    })
});




app.get('/register',function(req,res){
  if (req.session.user){
    req.session.error="您已登录";
    return res.redirect('/');  
  }
  console.log('注册');
  var error=req.session.error;
  req.session.error="";
  res.render('register',{
    title:'注册',
    error: error
  });
});


function checkInfo(username,password){
  var reg = /\w{3,20}/;//正则
  if(!reg.test(username)) return false;
  var lcase=false,ucase=false,digit=false;
  for (var i=0;i<password.length;i++){
    if (password[i]>='a' && password[i]<='z') lcase=true;
    if (password[i]>='A' && password[i]<='Z') ucase=true;
    if (password[i]>='0' && password[i]<='9') digit=true;
  }  
  return lcase&&ucase&&digit;
}

app.post('/register',function(req,res){
  var username = req.body.username, password=req.body.password, passwordRepeat=req.body.passwordRepeat;  if ( username.trim().length == 0 ){
    req.session.error="用户名不能为空";
    console.log("用户名不能为空");
    return res.redirect('/register');
  }
  
  if ( password.trim().length == 0 || passwordRepeat.trim().length == 0 ){
    req.session.error="密码不能为空";
    console.log("密码不能为空");
    return res.redirect('/register');
  }
 
  if ( password!=passwordRepeat ){
    req.session.error="两次输入密码不一致"
    console.log("两次输入密码不一致");
    return res.redirect('/register');
  }
  
  User.findOne({username:username},function(err, user){
    if (err){
      req.session.error="注册用户错误";
      console.log(err);
      return res.redirect('/register');
    }

    if (user){
      req.session.error="用户名已经存在"
      console.log("用户名已经存在");
      return res.redirect('/register');
    }

    if (!checkInfo(username,password)){
      req.session.error="用户名：只能是字母、数字、下划线的组合，长度3-20个字符 密码：长度不能少于6，必须同时包含数字、小写字母、大写字母";
      console.log("格式验证错误");
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
  
  if (req.session.user)
  {
    req.session.error="您已登录";
    return res.redirect('/');
  }
  
  var error=req.session.error;
  req.session.error="";
  res.render('login',{
    title: '登录',
    error: error
  });
});

app.post('/login',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  
  User.findOne({username:username},function(err,user) {
    if (err) {
      req.session.error="登录错误";
      console.log(err);
      return res.redirect('/login');
    }

    if (!user) {
      req.session.error="用户不存在";
      console.log('用户不存在');
      return res.redirect('/login');
    }

    var md5= crypto.createHash('md5');
    var md5password=md5.update(password).digest('hex');
    if (user.password!==md5password){
      req.session.error="密码错误";
      console.log('密码错误');
      return res.redirect('/login');
    }
    
    console.log('登录成功');
    user.password=null;
    delete user.password;
    req.session.user=user;
    return res.redirect('/');

  });
});


app.get('/quit',function(req,res){
  console.log('退出');
  req.session.user=null;
  return res.redirect('/login');
});

app.get('/post',function(req,res){
  console.log('发布');
  var error=req.session.error;
  req.session.error="";
  res.render('post',{
    title:'发布',
    error: error 
  });
});

app.post('/post',function(req,res){
  var note = new Note({
    title: req.body.title,
    author: req.session.user.username,
    tag: req.body.tag,
    content: req.body.content
  });

  note.save(function(err,doc) {
    if (err){
      req.session.error="发表文章失败"
      console.log(err);
      return res.redirect('/post');
    }
    console.log('文章发表成功!')
    return res.redirect('/');
   
  });
});

app.get('/detail/:_id',function(req,res){
  console.log('查看笔记')
  Note.findOne({_id:req.params._id})
    .exec(function(err, art){
      if (err) {
        req.session.error="查看笔记失败";
        console.log(err);
        return res.redirect('/');
      }

      if (art) {
        var error=req.session.error;
        req.session.error="";
        res.render('detail',{
          title: '笔记详情',
          user: req.session.user,
          art: art,
          moment: moment,
          error: error
        });
      }

    });
});

app.listen(3000,function(req,res){
  console.log('app is running at port 3000');
});
