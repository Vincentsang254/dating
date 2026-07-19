const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { loadUser } = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const reportController = require("../controllers/reportController");
const blockController = require("../controllers/blockController");
const upload = require("../middlewares/multerUpload");

router.use(verifyToken);

router.get("/me", loadUser);

// Profile endpoints
router.get("/profile", profileController.getProfile);
router.get("/profile/:userId", profileController.getUserProfile);
router.put("/profile", profileController.updateProfile);
router.post("/profile/upload", upload.single("image"), profileController.uploadProfilePhoto);
router.delete("/profile/photo", profileController.deletePhoto);
router.put("/profile/photos/reorder", profileController.reorderPhotos);

// User reporting and blocking
router.post("/profile/report", reportController.reportUser);
router.post("/profile/block", blockController.blockUser);

module.exports = router;
