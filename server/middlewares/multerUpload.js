const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpg, png, webp, gif)."), false);
  },
});

module.exports = upload;
