const { Users, Conversations, Messages, Matches, BlockedUsers } = require("../models");
const { Op } = require("sequelize");

// Get or create conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!otherUserId || userId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        data: null,
        error: "Cannot create conversation with yourself or invalid user",
      });
    }

    // Check if users have matched
    const match = await Matches.findOne({
      where: {
        [Op.or]: [
          { userId, matchedUserId: otherUserId },
          { userId: otherUserId, matchedUserId: userId },
        ],
        status: "accepted",
      },
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: "Conversation not allowed",
        data: null,
        error: "You must be matched to start a conversation",
      });
    }

    const blocked = await BlockedUsers.findOne({
      where: {
        [Op.or]: [
          { blockerId: userId, blockedUserId: otherUserId },
          { blockerId: otherUserId, blockedUserId: userId },
        ],
      },
    });

    if (blocked) {
      return res.status(403).json({
        success: false,
        message: "Conversation not allowed",
        data: null,
        error: "One of the users has blocked the other",
      });
    }

    // Find or create conversation
    const [conversation] = await Conversations.findOrCreate({
      where: {
        [Op.or]: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
      defaults: {
        user1Id: userId,
        user2Id: otherUserId,
      },
      include: [
        {
          model: Users,
          as: "user1",
          attributes: ["id", "name", "profilePic"],
        },
        {
          model: Users,
          as: "user2",
          attributes: ["id", "name", "profilePic"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Conversation retrieved or created successfully",
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting or creating conversation",
      data: null,
      error: error.message,
    });
  }
};

// Get user conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const conversations = await Conversations.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        {
          model: Users,
          as: "user1",
          attributes: ["id", "name", "profilePic"],
        },
        {
          model: Users,
          as: "user2",
          attributes: ["id", "name", "profilePic"],
        },
        {
          model: Users,
          as: "lastMessageUser",
          attributes: ["id", "name"],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching conversations",
      data: null,
      error: error.message,
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversations.findByPk(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        data: null,
        error: "The conversation does not exist",
      });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
        data: null,
        error: "You don't have access to this conversation",
      });
    }

    // Get messages
    const messages = await Messages.findAll({
      where: { conversationId },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["id", "name", "profilePic"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Mark messages as read
    await Messages.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId,
          recipientId: userId,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      data: null,
      error: error.message,
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!conversationId || !content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid message data",
        data: null,
        error: "conversationId and content are required",
      });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversations.findByPk(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        data: null,
        error: "The conversation does not exist",
      });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
        data: null,
        error: "You don't have access to this conversation",
      });
    }

    // Determine recipient
    const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

    // Create message
    const message = await Messages.create({
      conversationId,
      senderId: userId,
      recipientId,
      content: content.trim(),
    });

    // Update conversation's last message
    await Conversations.update(
      {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        lastMessageUserId: userId,
      },
      { where: { id: conversationId } }
    );

    // Fetch created message with sender info
    const messageWithSender = await Messages.findByPk(message.id, {
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ["id", "name", "profilePic"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageWithSender,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      data: null,
      error: error.message,
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversations.findByPk(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        data: null,
        error: "The conversation does not exist",
      });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
        data: null,
        error: "You don't have access to this conversation",
      });
    }

    // Mark all messages as read
    await Messages.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId,
          recipientId: userId,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: { conversationId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      data: null,
      error: error.message,
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Messages.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully",
      data: { unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      data: null,
      error: error.message,
    });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversations.findByPk(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        data: null,
        error: "The conversation does not exist",
      });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
        data: null,
        error: "You don't have access to this conversation",
      });
    }

    // Delete all messages in conversation
    await Messages.destroy({ where: { conversationId } });

    // Delete conversation
    await Conversations.destroy({ where: { id: conversationId } });

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: { conversationId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting conversation",
      data: null,
      error: error.message,
    });
  }
};

// Check user premium features
exports.getPremiumFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkPremiumStatus, getPremiumFeatures } = require("../utils/checkPremiumStatus");

    const features = await getPremiumFeatures(userId);

    res.status(200).json({
      success: true,
      message: "Premium features retrieved successfully",
      data: features,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking premium status",
      data: null,
      error: error.message,
    });
  }
};
