// src/config/cloudinaryConfig.ts
 import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();


if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('Cloudinary configuration variables are missing in the environment');
}


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config:', process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

export default cloudinary



/* import { v2 as cloudinary } from 'cloudinary';  // Cambié la importación para acceder a cloudinary.v2
import dotenv from 'dotenv';

dotenv.config();

// Verifica que las variables de entorno estén definidas
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('Cloudinary configuration variables are missing in the environment');
}

// Configura Cloudinary con las credenciales de tu archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config:', process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

export default cloudinary;

 */