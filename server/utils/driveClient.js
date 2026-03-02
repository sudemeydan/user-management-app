const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; 

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const uploadToDrive = async (fileObj) => {
  try {
    console.log("🚀 Yükleme Başlıyor (OAuth2 Modu)... Hedef Klasör:", FOLDER_ID);

    const fileMetadata = {
      name: `user-${Date.now()}-${fileObj.originalname}`,
      parents: [FOLDER_ID], 
    };

    const media = {
      mimeType: fileObj.mimetype,
      body: fs.createReadStream(fileObj.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink, thumbnailLink', 
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    const thumbnail = response.data.thumbnailLink; 
    console.log("✅ Dosya Drive'a Yüklendi! ID:", fileId);

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    
    let publicUrl = '';
    
    if (thumbnail) {
        publicUrl = thumbnail.replace(/=s\d+/, '=s1000');
    } else {
        publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return { fileId, publicUrl };

  } catch (error) {
    console.error('❌ Google Drive Yükleme Hatası:', error.message);
    if (error.response) {
         console.error("🔍 API Hatası Detayı:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Resim Drive\'a yüklenemedi.');
  }
};

const deleteFromDrive = async (fileId) => {
  try {
    await drive.files.delete({ fileId: fileId });
    console.log(`🗑️ Drive'dan silindi: ${fileId}`);
  } catch (error) {
    console.log('Silme işlemi pas geçildi.');
  }
};

module.exports = { uploadToDrive, deleteFromDrive };