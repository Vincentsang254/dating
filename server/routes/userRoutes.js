const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { loadUser } = require("../controllers/authController");

router.get("/me", verifyToken, loadUser);

module.exports = router;
