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

const uploadToDrive = async (fileObj, customFolderId = null) => {
  try {
    // Eğer customFolderId gelirse (CV için) onu kullan, gelmezse varsayılan resim klasörünü (FOLDER_ID) kullan
    const targetFolderId = customFolderId || FOLDER_ID;
    console.log("🚀 Yükleme Başlıyor... Hedef Klasör:", targetFolderId);

    const fileMetadata = {
      name: `file-${Date.now()}-${fileObj.originalname}`,
      parents: [targetFolderId], // Artık dinamik
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
    console.log("✅ Dosya Drive'a Yüklendi! ID:", fileId);

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    let publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { fileId, publicUrl };

  } catch (error) {
    console.error('❌ Google Drive Yükleme Hatası:', error.message);
    throw new Error('Dosya Drive\'a yüklenemedi.');
  }
};
const uploadBufferToDrive = async (buffer, fileName, mimeType, customFolderId = null) => {
  try {
    const targetFolderId = customFolderId || FOLDER_ID;
    const { Readable } = require('stream');
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: `ats-${Date.now()}-${fileName}`,
      parents: [targetFolderId],
    };

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    let publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return { fileId, publicUrl };
  } catch (error) {
    console.error('❌ Google Drive Buffer Yükleme Hatası:', error.message);
    throw new Error('Dosya Drive\'a yüklenemedi.');
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

const streamFile = async (fileId, res) => {
  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    response.data.on('end', () => { });
    response.data.on('error', err => {
      console.error('Error reading drive stream', err);
      if (!res.headersSent) res.status(500).end();
    });
    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching file for streaming:', error.message);
    if (!res.headersSent) res.status(404).send('Not Found');
  }
};

module.exports = { uploadToDrive, uploadBufferToDrive, deleteFromDrive, streamFile };