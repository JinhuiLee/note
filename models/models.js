var Waterline = require('waterline');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createTime: {
    type: Date,
    default: Date.now
  }

});

var noteSchema = Waterline.Collection.extend({
  identity: 'note',
  connection: 'mysql',
  schema: true,
  attributes: 
  {
    title:'string',
    author:'string',
    tag:'string',
    content:'string',
    createTime:'date'
  }
});

exports.Note = noteSchema;
exports.User = mongoose.model('User',userSchema);
