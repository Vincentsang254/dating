const { Users } = require("../models");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const sharp = require("sharp");

// Configure Cloudinary using environment variables with safe fallback values.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "vincentsang",
  api_key: process.env.CLOUDINARY_API_KEY || "455286944547629",
  api_secret: process.env.CLOUDINARY_API_SECRET || "764okYVYwP9WOp5iXMKS7Oxbr7c",
});

const getProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ success: false, message: "No User Found", data: null });
    return res.status(200).json({ success: true, message: "Profile Retrieved Successfully", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve profile.", data: null, error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "No User Found", data: null });

    const updatable = ["name", "bio", "interests", "preferences", "photos", "gender", "age", "location", "phoneNumber", "profilePic"];
    updatable.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    await user.save();
    const safe = user.toJSON();
    delete safe.password;
    return res.status(200).json({ success: true, message: "Profile Updated Successfully", data: safe });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update profile.", data: null, error: error.message });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    // Expecting either `image` (base64 or file path) or a multipart file named image
    const fileData = req.body.image || (req.file && req.file.path);
    if (!fileData) {
      return res.status(400).json({ success: false, message: "No image provided.", data: null });
    }

    // if a multipart file was uploaded, validate mime type (multer already filters, but double-check)
    if (req.file && req.file.mimetype && !req.file.mimetype.startsWith("image/")) {
      // remove temp file
      if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({ success: false, message: "Uploaded file is not a valid image.", data: null });
    }

    // If we received a multipart file path, resize it first to a reasonable size
    let uploadPath = fileData;
    if (req.file && req.file.path) {
      const resizedPath = `${req.file.path}-resized.jpg`;
      await sharp(req.file.path).resize(800, 800, { fit: "cover" }).toFormat("jpeg").toFile(resizedPath);
      uploadPath = resizedPath;
    }

    const result = await cloudinary.uploader.upload(uploadPath, { folder: "profiles" });

    // update user profilePic
    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "No User Found", data: null });
    user.profilePic = result.secure_url;
    // append to photos
    if (user.photos) user.photos = `${user.photos},${result.secure_url}`;
    else user.photos = result.secure_url;
    await user.save();

    // cleanup uploaded temp files if present
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      try { fs.unlinkSync(`${req.file.path}-resized.jpg`); } catch (e) {}
    }

    return res.status(200).json({ success: true, message: "Photo uploaded successfully", data: { url: result.secure_url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Photo upload failed.", data: null, error: error.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { url } = req.body || req.query;
    if (!url) return res.status(400).json({ success: false, message: "Photo URL required.", data: null });

    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "No User Found", data: null });

    if (!user.photos) return res.status(400).json({ success: false, message: "No photos to delete.", data: null });

    const list = user.photos.split(',').map((s) => s.trim()).filter(Boolean);
    const filtered = list.filter((p) => p !== url);
    user.photos = filtered.join(',');
    if (user.profilePic === url) user.profilePic = filtered[0] || null;
    await user.save();

    return res.status(200).json({ success: true, message: "Photo deleted.", data: { photos: user.photos } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete photo.", data: null, error: error.message });
  }
};

const reorderPhotos = async (req, res) => {
  try {
    const { photos } = req.body;
    if (!Array.isArray(photos)) return res.status(400).json({ success: false, message: "Photos must be an array.", data: null });

    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "No User Found", data: null });

    user.photos = photos.join(',');
    if (photos.length) user.profilePic = photos[0];
    await user.save();

    return res.status(200).json({ success: true, message: "Photos reordered.", data: { photos: user.photos } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reorder photos.", data: null, error: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, deletePhoto, reorderPhotos };

