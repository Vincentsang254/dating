const axios = require("axios");

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_URL = process.env.NOWPAYMENTS_API_URL || "https://api.nowpayments.io/v1";
const CLIENT_URL = process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:5173";
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

const buildReturnUrl = (path = "/user/vip") => {
  const base = CLIENT_URL.endsWith("/") ? CLIENT_URL.slice(0, -1) : CLIENT_URL;
  return `${base}${path}`;
};

const createNowPayment = async ({
  amount,
  currency = "USD",
  orderId,
  orderDescription,
  planTier,
  billingCycle = "monthly",
}) => {
  const normalizedAmount = Number(amount || 0);
  const fallbackUrl = buildReturnUrl(`/user/vip?payment=demo&plan=${encodeURIComponent(planTier || "premium")}`);

  if (!API_KEY) {
    return {
      success: true,
      fallback: true,
      paymentUrl: fallbackUrl,
      paymentId: orderId,
      status: "pending",
      message: "NOWPayments credentials not configured. Using local demo redirect.",
      price_amount: normalizedAmount,
      price_currency: currency,
      pay_currency: currency,
      pay_amount: normalizedAmount,
      pay_address: null,
      network: null,
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/payment`,
      {
        price_amount: normalizedAmount,
        price_currency: currency,
        pay_currency: currency,
        order_id: String(orderId),
        order_description: orderDescription || `${planTier || "premium"} subscription (${billingCycle})`,
        success_url: `${buildReturnUrl("/user/vip?payment=success")}&order_id=${encodeURIComponent(String(orderId))}&plan=${encodeURIComponent(planTier || "premium")}`,
        cancel_url: `${buildReturnUrl("/user/vip?payment=cancelled")}&order_id=${encodeURIComponent(String(orderId))}&plan=${encodeURIComponent(planTier || "premium")}`,
        ipn_callback_url: `${buildReturnUrl("/api/payment/nowpayments/webhook")}`,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const data = response?.data || {};

    return {
      success: true,
      fallback: false,
      paymentId: data.payment_id || data.id || orderId,
      paymentUrl: data.payment_url || data.invoice_url || null,
      status: data.payment_status || "pending",
      message: data.message || "NOWPayments payment created",
      price_amount: data.price_amount || normalizedAmount,
      price_currency: data.price_currency || currency,
      pay_currency: data.pay_currency || null,
      pay_amount: data.pay_amount || null,
      pay_address: data.pay_address || null,
      network: data.network || null,
      raw: data,
    };
  } catch (error) {
    console.error("NOWPayments API error:", error?.response?.data || error.message);
    return {
      success: true,
      fallback: true,
      paymentUrl: fallbackUrl,
      paymentId: orderId,
      status: "pending",
      message: "NOWPayments request failed. Using local demo redirect.",
      price_amount: normalizedAmount,
      price_currency: currency,
      pay_currency: currency,
      pay_amount: normalizedAmount,
      pay_address: null,
      network: null,
    };
  }
};

const getNowPaymentStatus = async (paymentId) => {
  if (!API_KEY) {
    return { success: true, status: "pending", paymentId };
  }

  try {
    const response = await axios.get(`${API_URL}/payment/${paymentId}`, {
      headers: {
        "x-api-key": API_KEY,
      },
      timeout: 20000,
    });

    const data = response?.data || {};
    return {
      success: true,
      paymentId: data.payment_id || data.id || paymentId,
      status: data.payment_status || data.status || "pending",
      data,
    };
  } catch (error) {
    console.error("NOWPayments status check error:", error?.response?.data || error.message);
    return { success: true, paymentId, status: "pending" };
  }
};

module.exports = {
  createNowPayment,
  getNowPaymentStatus,
  API_KEY,
  IPN_SECRET,
};

