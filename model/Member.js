const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema(
 {
  fullName:{
    type: String,
    required:true,
    trim: true
  },
  cin:{
    type: String,
    required:true,
    trim:true
  },
  profil:{
    type:String,
    required:true,
    trim:true
  },
  departement:{
    type:String,
    enum:['Front-End','Back-End','Design UX/UI','Cyber-Security'],
    required:true
  },
  hiredDate:{
    type: Date,
    required: true
  },
  email:{
    type:String,
    required: true
  },
  phoneNum:{
    type:String,
    required:true
  }
 },
 {
  timestamps: true
 }
)

module.exports = mongoose.model('Member',memberSchema);