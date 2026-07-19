const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "vincentsang",
  api_key: process.env.CLOUDINARY_API_KEY || "455286944547629",
  api_secret: process.env.CLOUDINARY_API_SECRET || "764okYVYwP9WOp5iXMKS7Oxbr7c",
});

const uploadMedia = async (filePath, folder = "messages", resourceType = "auto") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
};

module.exports = { uploadMedia };
