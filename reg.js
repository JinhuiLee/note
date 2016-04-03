str = '3adcdefg';//用户名
var reg = /\w{3,20}/;//正则
if(reg.test(str)){
 console.log('验证成功');
}else{
 console.log('验证失败');
}
