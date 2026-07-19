const { Op, fn, col } = require("sequelize");
const { Users, Payments, Subscriptions, SubscriptionPlans, Matches, Messages, UserReports } = require("../models");

const getDashboardOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      activeSubscriptions,
      totalRevenue,
      totalMatches,
      totalMessages,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      Users.count({ paranoid: false }),
      Users.count({ where: { userType: "customer" }, paranoid: false }),
      Users.count({ where: { userType: "admin" }, paranoid: false }),
      Subscriptions.count({ where: { status: "active" } }),
      Payments.sum("amount", {
        where: {
          status: { [Op.in]: ["confirmed", "finished"] },
        },
      }),
      Matches.count({ where: { status: "accepted" } }),
      Messages.count(),
      Users.findAll({
        attributes: ["id", "name", "email", "userType", "verified", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 5,
        paranoid: false,
      }),
      Payments.findAll({
        attributes: ["id", "reference", "amount", "status", "provider", "createdAt"],
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard overview retrieved successfully",
      data: {
        totalUsers,
        totalCustomers,
        totalAdmins,
        activeSubscriptions,
        totalRevenue: Number(totalRevenue || 0),
        totalMatches,
        totalMessages,
        recentUsers,
        recentPayments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin overview.",
      data: null,
      error: error.message,
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "name", "email", "phoneNumber", "userType", "verified", "createdAt"],
      order: [["createdAt", "DESC"]],
      paranoid: false,
      limit: 20,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
      data: null,
      error: error.message,
    });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payments.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    return res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payments.",
      data: null,
      error: error.message,
    });
  }
};

const getAdminReports = async (req, res) => {
  try {
    const [premiumUsers, vipUsers, pendingPayments, openReports] = await Promise.all([
      Subscriptions.count({ where: { tier: "premium", status: "active" } }),
      Subscriptions.count({ where: { tier: "vip", status: "active" } }),
      Payments.count({ where: { status: "pending" } }),
      UserReports.count({ where: { status: "open" } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin reports retrieved successfully",
      data: {
        premiumUsers,
        vipUsers,
        pendingPayments,
        openReports,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin reports.",
      data: null,
      error: error.message,
    });
  }
};

const getAdminUserReports = async (req, res) => {
  try {
    const reports = await UserReports.findAll({
      where: { status: "open" },
      include: [
        {
          model: Users,
          as: "reporter",
          attributes: ["id", "name", "email"],
        },
        {
          model: Users,
          as: "reportedUser",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    return res.status(200).json({
      success: true,
      message: "User reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user reports.",
      data: null,
      error: error.message,
    });
  }
};

const reviewUserReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!["reviewed", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid report status.", data: null });
    }

    const report = await UserReports.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found.", data: null });
    }

    report.status = status;
    await report.save();

    return res.status(200).json({ success: true, message: "Report updated successfully.", data: report });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update report.",
      data: null,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardOverview,
  getAdminUsers,
  getAdminPayments,
  getAdminReports,
  getAdminUserReports,
  reviewUserReport,
};
