const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png, and webp images are allowed'), false);
    }
  },
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'marketplace' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function withCloudinaryUpload(multerMiddleware) {
  return async function (req, res, next) {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);
      const files = req.files ? (Array.isArray(req.files) ? req.files : []) : [];
      if (files.length === 0) return next();
      try {
        const results = await Promise.all(files.map((f) => uploadBufferToCloudinary(f.buffer)));
        // Preserve `path` field for backward compatibility with route handlers
        req.files = files.map((f, i) => ({
          ...f,
          path: results[i].secure_url,
          cloudinaryId: results[i].public_id,
        }));
        next();
      } catch (uploadErr) {
        next(uploadErr);
      }
    });
  };
}

const upload = {
  array: (fieldName, maxCount) => withCloudinaryUpload(memUpload.array(fieldName, maxCount)),
  single: (fieldName) => withCloudinaryUpload(memUpload.single(fieldName)),
  fields: (fields) => withCloudinaryUpload(memUpload.fields(fields)),
};

module.exports = { upload };
