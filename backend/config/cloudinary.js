const multer = require('multer');
const path = require('path');
const fs = require('fs');

let cloudinary = null;
let upload;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  // Cloud storage mode
  const cloudinaryLib = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinaryLib,
    params: {
      folder: 'souq-amman-digital',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  cloudinary = cloudinaryLib;
  upload = multer({ storage });
} else {
  // Local storage mode - save images to /uploads folder
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, uniqueName + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  };

  upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
}

module.exports = { cloudinary, upload };
