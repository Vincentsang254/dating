const { Payments } = require("../models");

const createNowPayment = async (req, res) => {
  try {
    const payment = await Payments.create({
      reference: `payment-${Date.now()}`,
      provider: "NOWPayments",
      amount: req.body.amount || 0,
      userId: req.user?.id,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment Created Successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create payment.",
      data: null,
      error: error.message,
    });
  }
};

const getNowPaymentStatus = async (req, res) => {
  try {
    const payment = await Payments.findOne({
      where: { id: req.params.paymentId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Retrieved Successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment.",
      data: null,
      error: error.message,
    });
  }
};

const verifyNowPayment = async (req, res) => {
  try {
    const payment = await Payments.findOne({
      where: { id: req.params.paymentId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Verified",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
      data: null,
      error: error.message,
    });
  }
};

const nowPaymentsWebhook = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Webhook received",
    data: null,
  });
};

module.exports = {
  createNowPayment,
  getNowPaymentStatus,
  verifyNowPayment,
  nowPaymentsWebhook,
};

