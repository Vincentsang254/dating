const { UserReports, Users } = require("../models");

const reportUser = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reportedUserId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ success: false, message: "Reported user and reason are required.", data: null });
    }

    if (reportedUserId === reporterId) {
      return res.status(400).json({ success: false, message: "You cannot report yourself.", data: null });
    }

    const reportedUser = await Users.findByPk(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ success: false, message: "Reported user not found.", data: null });
    }

    const report = await UserReports.create({
      reporterId,
      reportedUserId,
      reason,
    });

    return res.status(201).json({ success: true, message: "User reported successfully.", data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to submit report.", data: null, error: error.message });
  }
};

module.exports = { reportUser };