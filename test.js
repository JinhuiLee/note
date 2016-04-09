var http=require("http");
var url=require("url");
var querystring=require("querystring");


var server=http.createServer(function(req,res){
  console.log("helloworld");
  res.write(String(req.method));
  console.log(req.headers);
  res.write("aaa");

  if (req.url=="/")
  {
    res.end("access /");
  }
  var tmp=url.parse(req.url);
  console.log(tmp.query);
  var jsonobj;
  console.log(jsonobj=querystring.parse(tmp.query));
  
  if (jsonobj.id=='1' && jsonobj.name=='2' )
  {
    res.end("jsonobj.id==1 && jsonobj.name==2");
  }

  

});

server.listen(3000);
