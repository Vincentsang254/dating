const { Users, Likes, Matches, BlockedUsers } = require("../models");
const { Op } = require("sequelize");

// Like a user
exports.likeUser = async (req, res) => {
  try {
    const { likedUserId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!likedUserId || userId === likedUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user to like",
        data: null,
        error: "Cannot like yourself or invalid user ID",
      });
    }

    // Check if liked user exists
    const likedUser = await Users.findByPk(likedUserId);
    if (!likedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
        error: "The user you are trying to like does not exist",
      });
    }

    const blocked = await BlockedUsers.findOne({
      where: {
        [Op.or]: [
          { blockerId: userId, blockedUserId: likedUserId },
          { blockerId: likedUserId, blockedUserId: userId },
        ],
      },
    });

    if (blocked) {
      return res.status(403).json({
        success: false,
        message: "Action not allowed",
        data: null,
        error: "One of the users has blocked the other",
      });
    }

    // Check if already liked
    const existingLike = await Likes.findOne({
      where: { userId, likedUserId },
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "Already liked",
        data: null,
        error: "You have already liked this user",
      });
    }

    // Create like
    const like = await Likes.create({ userId, likedUserId });

    // Check for mutual like (match)
    const mutualLike = await Likes.findOne({
      where: { userId: likedUserId, likedUserId: userId },
    });

    if (mutualLike) {
      // Create mutual match
      await Matches.create({
        userId,
        matchedUserId: likedUserId,
        status: "accepted",
      });

      // Create reverse match
      await Matches.create({
        userId: likedUserId,
        matchedUserId: userId,
        status: "accepted",
      });
    }

    res.status(201).json({
      success: true,
      message: mutualLike ? "Match found!" : "User liked successfully",
      data: {
        like,
        isMatch: !!mutualLike,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking user",
      data: null,
      error: error.message,
    });
  }
};

// Unlike a user
exports.unlikeUser = async (req, res) => {
  try {
    const { likedUserId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!likedUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        data: null,
        error: "likedUserId is required",
      });
    }

    // Find and delete the like
    const like = await Likes.findOne({
      where: { userId, likedUserId },
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
        data: null,
        error: "You haven't liked this user",
      });
    }

    await like.destroy();

    res.status(200).json({
      success: true,
      message: "User unliked successfully",
      data: { likedUserId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unliking user",
      data: null,
      error: error.message,
    });
  }
};

// Get user likes (who this user liked)
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;

    const likes = await Likes.findAll({
      where: { userId },
      include: [
        {
          model: Users,
          as: "liked",
          attributes: [
            "id",
            "name",
            "bio",
            "age",
            "location",
            "profilePic",
            "photos",
            "interests",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "User likes retrieved successfully",
      data: likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user likes",
      data: null,
      error: error.message,
    });
  }
};

// Get likes received (who liked this user)
exports.getLikesReceived = async (req, res) => {
  try {
    const userId = req.user.id;

    const likesReceived = await Likes.findAll({
      where: { likedUserId: userId },
      include: [
        {
          model: Users,
          as: "liker",
          attributes: [
            "id",
            "name",
            "bio",
            "age",
            "location",
            "profilePic",
            "photos",
            "interests",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Received likes retrieved successfully",
      data: likesReceived,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching received likes",
      data: null,
      error: error.message,
    });
  }
};

// Get user matches
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Matches.findAll({
      where: {
        [Op.or]: [{ userId }, { matchedUserId: userId }],
        status: "accepted",
      },
      include: [
        {
          model: Users,
          as: "user",
          attributes: [
            "id",
            "name",
            "bio",
            "age",
            "location",
            "profilePic",
            "photos",
            "interests",
          ],
        },
        {
          model: Users,
          as: "matchedUser",
          attributes: [
            "id",
            "name",
            "bio",
            "age",
            "location",
            "profilePic",
            "photos",
            "interests",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format matches to always show the other user
    const formattedMatches = matches.map((match) => ({
      ...match.toJSON(),
      otherUser:
        match.userId === userId ? match.matchedUser : match.user,
    }));

    res.status(200).json({
      success: true,
      message: "User matches retrieved successfully",
      data: formattedMatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user matches",
      data: null,
      error: error.message,
    });
  }
};

// Discover users (get users to like)
exports.discoverUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    // Get users this user has already liked or matched with
    const likedUsers = await Likes.findAll({
      where: { userId },
      attributes: ["likedUserId"],
    });

    const matchedUsers = await Matches.findAll({
      where: {
        [Op.or]: [{ userId }, { matchedUserId: userId }],
      },
      attributes: ["userId", "matchedUserId"],
    });

    const blockedUsers = await BlockedUsers.findAll({
      where: {
        [Op.or]: [
          { blockerId: userId },
          { blockedUserId: userId },
        ],
      },
      attributes: ["blockerId", "blockedUserId"],
    });

    const blockedIds = blockedUsers.flatMap((block) =>
      block.blockerId === userId ? [block.blockedUserId] : [block.blockerId]
    );

    const excludeIds = [
      userId,
      ...likedUsers.map((l) => l.likedUserId),
      ...matchedUsers.flatMap((m) =>
        m.userId === userId ? m.matchedUserId : m.userId
      ),
      ...blockedIds,
    ];

    // Get users to discover
    const users = await Users.findAll({
      where: {
        id: { [Op.notIn]: excludeIds },
        verified: true,
        userType: { [Op.in]: ["customer", "vip"] },
      },
      attributes: [
        "id",
        "name",
        "bio",
        "age",
        "location",
        "profilePic",
        "photos",
        "interests",
        "gender",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Users discovered successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error discovering users",
      data: null,
      error: error.message,
    });
  }
};

// Check if two users have matched
exports.checkMatch = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const userId = req.user.id;

    const match = await Matches.findOne({
      where: {
        [Op.or]: [
          { userId, matchedUserId: otherUserId },
          { userId: otherUserId, matchedUserId: userId },
        ],
        status: "accepted",
      },
    });

    res.status(200).json({
      success: true,
      message: "Match status retrieved",
      data: { isMatch: !!match },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking match",
      data: null,
      error: error.message,
    });
  }
};
