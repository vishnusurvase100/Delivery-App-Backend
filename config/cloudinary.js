const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary credentials (inhe .env file mein daalna)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food_delivery_assets', // Cloudinary mein is naam ka folder ban jayega
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // Image size optimize karne ke liye
  },
});

const upload = multer({ storage: storage });

module.exports = upload;