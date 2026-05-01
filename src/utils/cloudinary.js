import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'drgft5mud',
  api_key: '251341351497823',
  api_secret: 'NbUs7teDq7cSJBOZ0zDGMQQZuTM',
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
