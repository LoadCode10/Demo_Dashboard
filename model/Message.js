const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    gmailId:{
      type: String,
      unique: true
    },
    senderEmail:{
      type: String,
      required:true,
      trim:true,
      lowercase:true
    },
    subject:{
      type: String
    },
    content:{
      type: String
    }
  },{
    timestamps:true
  }
);

module.exports = mongoose.model('Message',messageSchema);