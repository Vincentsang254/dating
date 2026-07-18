import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Crown, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  activateSubscription,
  cancelSubscription,
  createNowPayment,
  getUserSubscription,
  listSubscriptionPlans,
} from "@/redux/slices/paymentSlice";

const featureMap = {
  free: ["Basic profile access", "Browse and like profiles", "Message support"],
  premium: [
    "All free features",
    "Voice messages",
    "Video calls",
    "Voice calls",
    "Screen sharing",
  ],
  vip: [
    "Everything in Premium",
    "Priority visibility",
    "VIP support",
    "Enhanced matching boost",
  ],
};

const PremiumPage = () => {
  const dispatch = useDispatch();
  const { list, current, status, error } = useSelector((state) => state.payment);
  const { name } = useSelector((state) => state.auth);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    dispatch(listSubscriptionPlans());
    dispatch(getUserSubscription());
  }, [dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentState = searchParams.get("payment");
    const orderId = searchParams.get("order_id");
    const planFromQuery = searchParams.get("plan") || "premium";

    if (paymentState === "success" && orderId) {
      dispatch(
        activateSubscription({
          planTier: planFromQuery,
          billingCycle: "monthly",
          paymentId: Number(orderId),
        })
      ).then((result) => {
        if (activateSubscription.fulfilled.match(result)) {
          dispatch(getUserSubscription());
        }
      });
    }
  }, [dispatch]);

  const activeTier = current?.plan?.tier || current?.tier || "free";

  const handleActivate = async (planTier) => {
    const result = await dispatch(
      activateSubscription({
        planTier,
        billingCycle: "monthly",
      })
    );

    if (activateSubscription.fulfilled.match(result)) {
      dispatch(getUserSubscription());
    }
  };

  const handleCheckout = async (plan) => {
    setCheckoutLoading(true);
    try {
      const result = await dispatch(
        createNowPayment({
          amount: plan.price,
          planTier: plan.tier,
          billingCycle: plan.billingCycle || "monthly",
          currency: "USD",
        })
      );

      if (createNowPayment.fulfilled.match(result)) {
        const checkoutUrl = result.payload?.data?.checkoutUrl || result.payload?.data?.paymentUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      }

      await handleActivate(plan.tier);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await dispatch(cancelSubscription({ reason: "User requested cancellation" }));

    if (cancelSubscription.fulfilled.match(result)) {
      dispatch(getUserSubscription());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-purple-50 to-pink-50 p-6 border border-primary/10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">SparkMatch Premium</p>
              <h1 className="text-3xl font-bold text-gray-900">Upgrade your dating experience</h1>
              <p className="text-gray-600 mt-2">
                Unlock premium messaging features and keep your profile in front of more people, {name || "there"}.
              </p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500">Current plan</p>
              <p className="text-lg font-semibold capitalize">{activeTier}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {list.map((plan) => {
            const isActive = activeTier === plan.tier;
            const isPremiumPlan = plan.tier !== "free";

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 shadow-sm transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white hover:border-primary/40"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{plan.tier}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  </div>
                  {plan.tier === "vip" ? <Crown className="h-6 w-6 text-amber-500" /> : <Sparkles className="h-6 w-6 text-primary" />}
                </div>

                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${Number(plan.price).toFixed(2)}</span>
                  <span className="text-sm text-gray-500">/ month</span>
                </div>

                <ul className="space-y-2 text-sm text-gray-700">
                  {featureMap[plan.tier]?.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2">
                  {isActive ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => (isPremiumPlan ? handleCheckout(plan) : handleActivate(plan.tier))}
                      disabled={status === "pending" || checkoutLoading}
                    >
                      {isPremiumPlan ? (checkoutLoading ? "Preparing checkout..." : `Pay with NOWPayments`) : "Start with Free"}
                    </Button>
                  )}

                  {activeTier !== "free" && !isActive && (
                    <Button variant="outline" className="w-full" onClick={handleCancel}>
                      Cancel Current Plan
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Premium benefits</h3>
            </div>
            <p className="text-sm text-gray-600">
              Premium unlocks voice messages, voice calls, video calls, and screen share for real-time interaction.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Safe and secure</h3>
            </div>
            <p className="text-sm text-gray-600">
              Subscription activation uses the existing authenticated payment and account flow, keeping the platform consistent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
