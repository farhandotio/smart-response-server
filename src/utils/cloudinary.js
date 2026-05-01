import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME || 'dypgqj8l7',
  api_key: config.CLOUDINARY_API_KEY || '251341351497823',
  api_secret: config.CLOUDINARY_API_SECRET || 'NbUs7teDq7cSJBOZ0zDGMQQZuTM',
});

export const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `smart-response/${folder}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
