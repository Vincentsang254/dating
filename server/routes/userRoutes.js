const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { loadUser } = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const upload = require("../middlewares/multerUpload");

router.get("/me", verifyToken, loadUser);

// Profile endpoints
router.get("/profile", verifyToken, profileController.getProfile);
router.put("/profile", verifyToken, profileController.updateProfile);
router.post("/profile/upload", verifyToken, upload.single("image"), profileController.uploadProfilePhoto);
router.delete("/profile/photo", verifyToken, profileController.deletePhoto);
router.put("/profile/photos/reorder", verifyToken, profileController.reorderPhotos);

module.exports = router;
