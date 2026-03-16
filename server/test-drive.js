const { google } = require('googleapis');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function testDrive() {
  try {
    console.log("Checking Drive connection...");
    const res = await drive.about.get({ fields: 'user' });
    console.log("✅ Connection Successful! User:", res.data.user.displayName);
  } catch (error) {
    console.error("❌ Drive Error:", error.message);
    if (error.message.includes('invalid_grant')) {
      console.error("CRITICAL: Your refresh token is invalid or revoked.");
    }
  }
}

testDrive();
