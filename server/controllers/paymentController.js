const { Op } = require("sequelize");
const { Payments, Subscriptions, SubscriptionPlans } = require("../models");
const { createNowPayment: createNowPaymentRequest, getNowPaymentStatus: getNowPaymentStatusRequest } = require("../services/nowpayment");

const ensureDefaultPlans = async () => {
  const existingPlans = await SubscriptionPlans.findAll({ attributes: ["tier"] });

  if (existingPlans.length > 0) {
    return;
  }

  await SubscriptionPlans.bulkCreate([
    {
      tier: "free",
      name: "Free",
      description: "Basic access",
      price: 0,
      billingCycle: "monthly",
      features: JSON.stringify({
        textMessages: true,
        voiceMessages: false,
        videoCalls: false,
        voiceCalls: false,
        screenShare: false,
      }),
      maxMatches: -1,
      maxLikes: -1,
      voiceMessages: false,
      videoCalls: false,
      voiceCalls: false,
      screenShare: false,
      active: true,
    },
    {
      tier: "premium",
      name: "Premium",
      description: "Unlock premium chat features",
      price: 9.99,
      billingCycle: "monthly",
      features: JSON.stringify({
        textMessages: true,
        voiceMessages: true,
        videoCalls: true,
        voiceCalls: true,
        screenShare: true,
      }),
      maxMatches: -1,
      maxLikes: -1,
      voiceMessages: true,
      videoCalls: true,
      voiceCalls: true,
      screenShare: true,
      active: true,
    },
    {
      tier: "vip",
      name: "VIP",
      description: "Premium plus priority support",
      price: 19.99,
      billingCycle: "monthly",
      features: JSON.stringify({
        textMessages: true,
        voiceMessages: true,
        videoCalls: true,
        voiceCalls: true,
        screenShare: true,
      }),
      maxMatches: -1,
      maxLikes: -1,
      voiceMessages: true,
      videoCalls: true,
      voiceCalls: true,
      screenShare: true,
      active: true,
    },
  ]);
};

const createNowPayment = async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0);
    const planTier = req.body.planTier || "premium";
    const billingCycle = req.body.billingCycle || "monthly";
    const currency = req.body.currency || "USD";
    const reference = req.body.reference || `payment-${Date.now()}`;
    const userId = req.user?.id;

    const payment = await Payments.create({
      reference,
      provider: "NOWPayments",
      amount,
      userId,
      status: "pending",
    });

    const gatewayResult = await createNowPaymentRequest({
      amount,
      currency,
      orderId: payment.id,
      orderDescription: `${planTier} subscription (${billingCycle})`,
      planTier,
      billingCycle,
    });

    await payment.update({
      paymentId: gatewayResult.paymentId || payment.id,
      priceCurrency: gatewayResult.price_currency || currency,
      payCurrency: gatewayResult.pay_currency || currency,
      payAmount: gatewayResult.pay_amount || amount,
      paymentUrl: gatewayResult.paymentUrl || null,
      payAddress: gatewayResult.pay_address || null,
      network: gatewayResult.network || null,
      status: gatewayResult.status || "pending",
    });

    return res.status(201).json({
      success: true,
      message: gatewayResult.message || "Payment Created Successfully",
      data: {
        ...payment.toJSON(),
        checkoutUrl: gatewayResult.paymentUrl || null,
        paymentUrl: gatewayResult.paymentUrl || null,
        fallback: gatewayResult.fallback || false,
      },
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

    const gatewayStatus = await getNowPaymentStatusRequest(payment.paymentId || payment.id);
    if (gatewayStatus?.status) {
      await payment.update({ status: gatewayStatus.status });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Retrieved Successfully",
      data: {
        ...payment.toJSON(),
        gatewayStatus,
      },
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

    const gatewayStatus = await getNowPaymentStatusRequest(payment.paymentId || payment.id);
    if (gatewayStatus?.status) {
      await payment.update({ status: gatewayStatus.status });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Verified",
      data: {
        ...payment.toJSON(),
        gatewayStatus,
      },
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
  try {
    const payload = req.body || {};
    const paymentId = payload.payment_id || payload.paymentId || payload.id;
    const orderId = payload.order_id || payload.orderId;
    const status = payload.payment_status || payload.status;

    if (!paymentId && !orderId) {
      return res.status(200).json({ success: true, message: "Webhook ignored", data: null });
    }

    const payment = await Payments.findOne({
      where: orderId ? { id: Number(orderId) } : { paymentId: String(paymentId) },
    });

    if (payment) {
      await payment.update({
        paymentId: String(paymentId || payment.paymentId || payment.id),
        status: status || payment.status,
        paidAt: status && ["confirmed", "finished"].includes(status) ? new Date() : payment.paidAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
      data: { paymentId, orderId, status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Webhook failed", data: null, error: error.message });
  }
};

const listSubscriptionPlans = async (req, res) => {
  try {
    await ensureDefaultPlans();

    const plans = await SubscriptionPlans.findAll({
      where: { active: true },
      order: [["price", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Subscription plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription plans.",
      data: null,
      error: error.message,
    });
  }
};

const getUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscriptions.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: SubscriptionPlans,
          as: "plan",
          attributes: [
            "id",
            "tier",
            "name",
            "description",
            "price",
            "billingCycle",
            "features",
            "voiceMessages",
            "videoCalls",
            "voiceCalls",
            "screenShare",
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: "User subscription retrieved successfully",
        data: {
          tier: "free",
          status: "active",
          userId: req.user.id,
          plan: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User subscription retrieved successfully",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription status.",
      data: null,
      error: error.message,
    });
  }
};

const activateSubscription = async (req, res) => {
  try {
    const { planTier = "premium", billingCycle = "monthly", paymentId } = req.body;
    const userId = req.user.id;

    await ensureDefaultPlans();

    const plan = await SubscriptionPlans.findOne({
      where: {
        tier: planTier,
        active: true,
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Selected subscription plan not found.",
        data: null,
      });
    }

    if (paymentId) {
      const payment = await Payments.findOne({
        where: {
          id: paymentId,
          userId,
          status: {
            [Op.in]: ["confirmed", "finished"],
          },
        },
      });

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed for this subscription activation.",
          data: null,
        });
      }
    }

    const endDate = new Date();
    const durationInDays = billingCycle === "annual" ? 365 : 30;
    endDate.setDate(endDate.getDate() + durationInDays);

    const [subscription] = await Subscriptions.upsert(
      {
        userId,
        paymentId: paymentId || null,
        tier: planTier,
        status: "active",
        startDate: new Date(),
        endDate,
        autoRenew: true,
        cancelledAt: null,
        cancellationReason: null,
      },
      {
        conflictFields: ["userId", "tier"],
      }
    );

    const savedSubscription = await Subscriptions.findByPk(subscription.id, {
      include: [
        {
          model: SubscriptionPlans,
          as: "plan",
          attributes: [
            "id",
            "tier",
            "name",
            "description",
            "price",
            "billingCycle",
            "features",
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Subscription activated successfully",
      data: savedSubscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to activate subscription.",
      data: null,
      error: error.message,
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscriptions.findOne({
      where: {
        userId: req.user.id,
        status: "active",
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found for this user.",
        data: null,
      });
    }

    await subscription.update({
      status: "cancelled",
      autoRenew: false,
      cancelledAt: new Date(),
      cancellationReason: req.body.reason || "User requested cancellation",
    });

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription.",
      data: null,
      error: error.message,
    });
  }
};

module.exports = {
  createNowPayment,
  getNowPaymentStatus,
  verifyNowPayment,
  nowPaymentsWebhook,
  listSubscriptionPlans,
  getUserSubscription,
  activateSubscription,
  cancelSubscription,
};

