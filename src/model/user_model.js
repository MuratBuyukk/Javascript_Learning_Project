const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
   firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
   },
   lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
   },
   email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowecase: true
   },
   profilePicture: {
      type: String,
      default: ''
   },
   isEmailActive: {
      type: Boolean,
   },
   password: {
      type: String,
      required: true,
      trim: true,
   },
}, { collection: 'users', timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;