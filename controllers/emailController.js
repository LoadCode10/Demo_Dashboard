const Message = require("../model/Message.js");
const {sendEmail} = require('../services/gmailService.js')

const getAllEmails = async(req,res)=>{
  try {
    const emails = await Message.find().sort({createdAt : -1}).limit(10);
    res.json(emails);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  };
};

const sendMessage = async(req,res)=>{
  const {
    recipientEmail,
    subject,
    messageContent
  } = req.body;

  if(!recipientEmail || !subject || !messageContent){
    return res.status(400).json({
      error: "All fields required"
    })
  }

  try {
    const result = await sendEmail(recipientEmail,subject,messageContent);

    return res.status(200).json({
      success: true,
      message:"Email sent!",
      result
    })    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {getAllEmails, sendMessage};