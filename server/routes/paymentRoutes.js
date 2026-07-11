const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middleware/verifyToken");
const verifyNowPaymentsWebhook = require("../middleware/verifyNowPaymentsWebhook");

/*
|--------------------------------------------------------------------------
| Create Crypto Payment
|--------------------------------------------------------------------------
| Creates a new NOWPayments payment and stores it in the database.
| Requires authentication.
*/
router.post(
  "/nowpayments/create",
  verifyToken,
  paymentController.createNowPayment
);

/*
|--------------------------------------------------------------------------
| Get Payment Status
|--------------------------------------------------------------------------
| Returns the current payment status from your database.
*/
router.get(
  "/nowpayments/:paymentId/status",
  verifyToken,
  paymentController.getNowPaymentStatus
);

/*
|--------------------------------------------------------------------------
| Verify Payment Manually
|--------------------------------------------------------------------------
| Queries NOWPayments API for the latest payment status.
*/
router.get(
  "/nowpayments/:paymentId/verify",
  verifyToken,
  paymentController.verifyNowPayment
);

/*
|--------------------------------------------------------------------------
| Webhook
|--------------------------------------------------------------------------
| Receives payment updates from NOWPayments.
| No authentication required.
| Protected using webhook signature verification.
*/
router.post(
  "/nowpayments/webhook",
  verifyNowPaymentsWebhook,
  paymentController.nowPaymentsWebhook
);

module.exports = router;
