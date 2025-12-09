import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback" // matches redirect URI in Google Console
);

// Generate URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline", // refresh token
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

console.log("Visit this URL to authorize:", authUrl);
