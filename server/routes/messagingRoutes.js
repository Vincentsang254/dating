const express = require("express");
const messagingController = require("../controllers/messagingController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get or create conversation with another user
router.post("/conversations", messagingController.getOrCreateConversation);

// Get user's conversations (list of all conversations)
router.get("/conversations", messagingController.getConversations);

// Get messages in a conversation
router.get("/conversations/:conversationId/messages", messagingController.getMessages);

// Send message to a conversation
router.post("/messages", messagingController.sendMessage);

// Upload a voice message attachment
router.post("/messages/voice", upload.single("audio"), messagingController.uploadVoiceMessage);

// Mark messages as read
router.post("/mark-read", messagingController.markAsRead);

// Get unread message count
router.get("/unread-count", messagingController.getUnreadCount);

// Get user's premium features
router.get("/premium-features", messagingController.getPremiumFeatures);

// Delete conversation
router.delete("/conversations/:conversationId", messagingController.deleteConversation);

module.exports = router;
