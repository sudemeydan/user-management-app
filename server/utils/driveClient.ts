import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

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

oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log("[INFO] Yeni Refresh Token Alindi! .env dosyasina kalici olarak kaydediliyor...");
    try {
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        let envData = fs.readFileSync(envPath, 'utf8');
        const regex = /^GOOGLE_DRIVE_REFRESH_TOKEN=.*$/m;
        if (regex.test(envData)) {
          envData = envData.replace(regex, `GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          envData += `\nGOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`;
        }
        fs.writeFileSync(envPath, envData);
        console.log("[OK] Yeni Refresh Token basariyla .env dosyasina kaydedildi.");
      }
    } catch (err) {
      console.error("âŒ Refresh Token .env dosyasÄ±na kaydedilirken hata:", err);
    }
  }
  console.log("[INFO] Access Token Yenilendi.");
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export interface DriveResponse {
  fileId: string | null | undefined;
  publicUrl: string;
}

export interface DriveFile {
  path: string;
  originalname: string;
  mimetype: string;
  [key: string]: any;
}

export const uploadToDrive = async (fileObj: DriveFile, customFolderId: string | null = null): Promise<DriveResponse> => {
  try {
    const targetFolderId = customFolderId || FOLDER_ID;
    console.log("[INFO] Yukleme Basliyor... Hedef Klasor:", targetFolderId);

    const fileMetadata = {
      name: `file-${Date.now()}-${fileObj.originalname}`,
      parents: [targetFolderId as string],
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
    } as any);

    const fileId = (response.data as any).id;
    console.log("[OK] Dosya Drive'a Yuklendi! ID:", fileId);

    await drive.permissions.create({
      fileId: fileId as string,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    } as any);

    let publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { fileId, publicUrl };

  } catch (error: any) {
    console.error('[ERROR] Google Drive Yukleme Hatasi:', error.message);
    throw new Error('Dosya Drive\'a yüklenemedi.');
  }
};

export const deleteFromDrive = async (fileId: string) => {
  try {
    await drive.files.delete({ fileId: fileId } as any);
    console.log(`🗑️ Drive'dan silindi: ${fileId}`);
  } catch (error) {
    console.log('Silme işlemi pas geçildi.');
  }
};

export const streamFile = async (fileId: string, res: Response) => {
  try {
    const response: any = await drive.files.get(
      { fileId: fileId, alt: 'media' } as any,
      { responseType: 'stream' }
    );
    response.data.on('end', () => { });
    response.data.on('error', (err: any) => {
      console.error('Error reading drive stream', err);
      if (!res.headersSent) res.status(500).end();
    });
    
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Error fetching file for streaming:', error.message);
    if (!res.headersSent) res.status(404).send('Not Found');
  }
};

const driveClient = { uploadToDrive, deleteFromDrive, streamFile };
export default driveClient;
