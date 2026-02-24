require('dotenv').config();
const {google} = require('googleapis');
const Message = require("../model/Message.js");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client
});

const checkEmails = async(io)=>{
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 5
    });
    const messages = res.data.messages || [];

    for(const m of messages){
      const exists = await Message.findOne({gmailId: m.id});
      if(exists) continue;
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "full"
      });
      const headers = msg.data.payload.headers;
      const from = headers.find(h => h.name === "From")?.value || "";
      const subject = headers.find(h => h.name === "Subject")?.value || "";
      const body = msg.data.snippet || "";

      if (from.includes("mehdihamza322@gmail.com")) continue;

      const newMsg = await Message.create({
        gmailId: m.id,
        senderEmail: from,
        subject,
        content: body
      });

      io.emit("new_email",newMsg);
      console.log("new email emitted", subject);
    }
  } catch (error) {
    console.error("Gmail check error:", error.message);
  }
};

const sendEmail = async (to, subject, message)=>{
  try {
    //my raw eamil string
    const str = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      message,
    ].join('\n');

    const encodedMail = Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMail,
      }
    });

    console.log(`To: ${to}; subject: ${subject}; message: ${message}`);
    return res.data;

  } catch (error) {
    console.error("Send Email Error:", error);
    throw error;
  }
}

module.exports = {checkEmails,sendEmail};
