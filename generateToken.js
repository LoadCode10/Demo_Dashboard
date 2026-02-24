require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost"
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly"
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",   // VERY IMPORTANT
  scope: SCOPES,
  prompt: "consent"         // Forces refresh token
});

console.log("Authorize this app by visiting this url:");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the code from that page here: ", async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log("\nYour Refresh Token:\n");
  console.log(tokens.refresh_token);
  rl.close();
});