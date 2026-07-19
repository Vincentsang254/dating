const { BlockedUsers, Users } = require("../models");

const blockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return res.status(400).json({ success: false, message: "Blocked user ID is required.", data: null });
    }

    if (blockedUserId === blockerId) {
      return res.status(400).json({ success: false, message: "You cannot block yourself.", data: null });
    }

    const blockedUser = await Users.findByPk(blockedUserId);
    if (!blockedUser) {
      return res.status(404).json({ success: false, message: "User not found.", data: null });
    }

    const [block] = await BlockedUsers.findOrCreate({
      where: { blockerId, blockedUserId },
      defaults: { blockerId, blockedUserId },
    });

    return res.status(200).json({ success: true, message: "User blocked successfully.", data: block });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to block user.", data: null, error: error.message });
  }
};

module.exports = { blockUser };