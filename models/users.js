const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  _id: mongoose.Schema.ObjectId,
  contact_id: mongoose.Schema.ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  status: Number
});

module.exports = mongoose.model('users', UsersSchema);