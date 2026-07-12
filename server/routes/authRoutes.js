const express = require("express");
const router = express.Router();
const { register, login, loadUser, logout } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.get("/me", verifyToken, loadUser);
router.post("/logout", verifyToken, logout);
router.get("/refresh-token", verifyToken, loadUser);

module.exports = router;
