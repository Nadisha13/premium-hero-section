/* global process */
import { useLoaderData, useFetcher } from "react-router";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import "../styles/pricing.css";
import prisma from "../db.server";
import { isBillingTestMode } from "../billing.server";

export const loader = async ({ request }) => {
  const { session, billing, redirect: shopifyRedirect } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);

  // 1. Get the current plan from DB before updating
  const subscription = await prisma.shopSubscription.findUnique({
    where: { shop },
  });
  const oldPlan = subscription ? subscription.plan : "FREE";

  // 2. Query Shopify Billing API to check active subscriptions
  const billingCheck = await billing.check({
    plans: ["Pro Plan", "Elite Plan"],
    isTest: isBillingTestMode(shop),
  });

  let activePlan = "FREE";
  if (billingCheck.hasActivePayment && billingCheck.appSubscriptions.length > 0) {
    const activeSub = billingCheck.appSubscriptions.find(sub => sub.status === "ACTIVE");
    if (activeSub) {
      if (activeSub.name === "Pro Plan") {
        activePlan = "PRO";
      } else if (activeSub.name === "Elite Plan") {
        activePlan = "PREMIUM";
      }
    }
  }

  // 3. Update DB if status changed
  if (oldPlan !== activePlan) {
    await prisma.shopSubscription.upsert({
      where: { shop },
      update: { plan: activePlan },
      create: { shop, plan: activePlan },
    });
  }

  // 4. If they just upgraded (oldPlan was FREE or different, and new activePlan is paid), redirect to dashboard
  if (oldPlan !== activePlan && activePlan !== "FREE") {
    const host = url.searchParams.get("host") || "";
    return shopifyRedirect(`/app?upgraded=true&shop=${shop}&host=${encodeURIComponent(host)}`);
  }

  return { plan: activePlan };
};

export const action = async ({ request }) => {
  try {
    const { billing, session, redirect: shopifyRedirect } = await authenticate.admin(request);

    if (request.method !== "POST") {
      return { error: "Invalid request method" };
    }

    const formData = await request.formData();
    const planName = formData.get("plan");

    if (planName === "FREE") {
      const url = new URL(request.url);
      const shop = url.searchParams.get("shop") || session.shop;
      const host = url.searchParams.get("host") || "";

      // 1. Query Shopify Billing API to check active subscriptions
      const billingCheck = await billing.check({
        plans: ["Pro Plan", "Elite Plan"],
        isTest: isBillingTestMode(shop),
      });

      // 2. Cancel active subscriptions on Shopify if any
      if (billingCheck.hasActivePayment && billingCheck.appSubscriptions.length > 0) {
        for (const sub of billingCheck.appSubscriptions) {
          if (sub.status === "ACTIVE") {
            try {
              await billing.cancel({
                subscriptionId: sub.id,
                isTest: isBillingTestMode(shop),
                prorate: true,
              });
            } catch (err) {
              console.error("Error cancelling subscription:", err);
            }
          }
        }
      }

      // 3. Update DB to FREE
      await prisma.shopSubscription.upsert({
        where: { shop },
        update: { plan: "FREE" },
        create: { shop, plan: "FREE" },
      });

      return shopifyRedirect(`/app?shop=${shop}&host=${encodeURIComponent(host)}`);
    }

    const planConfig = {
      PRO: "Pro Plan",
      PREMIUM: "Elite Plan",
    };

    const targetPlan = planConfig[planName];
    if (!targetPlan) {
      return { error: "Invalid plan selected" };
    }

    let appUrl = process.env.SHOPIFY_APP_URL || process.env.HOST;
    const hostHeader = request.headers.get("host");

    if (process.env.NODE_ENV === "development") {
      appUrl = process.env.HOST || hostHeader || appUrl;
    } else if (hostHeader && (
      hostHeader.includes("localhost") || 
      hostHeader.includes("trycloudflare.com") || 
      hostHeader.includes("ngrok") || 
      hostHeader.includes("portainer") ||
      hostHeader.includes("tunnelmole.net") ||
      hostHeader.includes("loca.lt")
    )) {
      appUrl = hostHeader;
    }

    if (appUrl && !appUrl.startsWith("http")) {
      appUrl = `https://${appUrl}`;
    }

    if (!appUrl) {
      console.error("Missing SHOPIFY_APP_URL or HOST environment variable");
      return { error: "Server configuration error: missing app URL" };
    }

    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || session.shop;
    const host = url.searchParams.get("host") || "";

    let returnUrl = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
    returnUrl = `${returnUrl}/app/pricing?plan=${planName}&shop=${shop}&host=${encodeURIComponent(host)}`;

    console.log("Requesting billing for plan:", targetPlan);

    // Request billing charge. This will return a redirect Response to the confirmation URL.
    return await billing.request({
      plan: targetPlan,
      isTest: isBillingTestMode(shop),
      returnUrl: returnUrl,
    });

  } catch (error) {
    if (error instanceof Response) {
      const reauthUrl = error.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
      const locationUrl = error.headers.get("Location");
      const redirectUrl = locationUrl || reauthUrl;

      if (redirectUrl) {
        return { redirectUrl };
      }
      throw error;
    }
    if (error.name === "AbortError" || error.message?.toLowerCase().includes("aborted")) {
      console.log("Subscription request was aborted:", error.message);
      return new Response("Request aborted", { status: 499 });
    }
    console.error("Subscription error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return { error: `Failed to process subscription: ${error.message}` };
  }
};

export default function PricingPage() {
  const { plan } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isSubmitting = fetcher.state !== "idle";
  const currentPlan = plan;

  useEffect(() => {
    if (fetcher.data?.error) {
      shopify.toast.show(`Error: ${fetcher.data.error}`, { isError: true });
    }
    if (fetcher.data?.redirectUrl) {
      // Safely redirect only if not in error state
      if (window.location.protocol !== "chrome-error:") {
        window.top.location.href = fetcher.data.redirectUrl;
      } else {
        shopify.toast.show("Connection issue. Please refresh and try again.", { isError: true });
      }
    }
  }, [fetcher.data, shopify]);

  const handleSubscribe = (planName) => {
    if (planName === currentPlan) return;
    fetcher.submit({ plan: planName }, { method: "POST" });
  };

  // eslint-disable-next-line react/prop-types
  const CheckIcon = ({ color = "#10b981" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div>
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>Select Your App Plan</h1>
          <p>{"Gain instant access to our curated designer forms. Create beautiful hero grids that elevate your store's conversions."}</p>
        </div>
        <div className="pricing-grid">

          {/* FREE PLAN */}
          <div className={`pricing-card ${currentPlan === "FREE" ? "active-plan" : ""}`}>
            {currentPlan === "FREE" && <div className="active-badge">Current Plan</div>}
            <div className="pricing-card-header">
              <h2 className="pricing-card-title">FREE STARTER</h2>
              <div className="pricing-card-price">$0</div>
              <div className="pricing-card-period">Free Forever</div>
            </div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item">
                <CheckIcon />
                <span>Unlock Free Templates Only</span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon />
                <span>Basic Hero Templates</span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon />
                <span>Limited Access</span>
              </li>
              <li className="pricing-feature-item" style={{ opacity: 0.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span>Pro Templates Locked</span>
              </li>
              <li className="pricing-feature-item" style={{ opacity: 0.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span>Elite Templates Locked</span>
              </li>
              <li className="pricing-feature-item" style={{ opacity: 0.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span>Premium Features Locked</span>
              </li>
            </ul>
            <button
              className="pricing-action-btn btn-free"
              onClick={() => handleSubscribe("FREE")}
              disabled={isSubmitting || currentPlan === "FREE"}
            >
              {currentPlan === "FREE" ? "Active" : "Downgrade to Free"}
            </button>
          </div>

          {/* PRO PLAN */}
          <div className={`pricing-card ${currentPlan === "PRO" ? "active-plan" : ""}`}>
            {currentPlan === "PRO" && <div className="active-badge">Current Plan</div>}
            {/*{currentPlan === "FREE" && <div className="popular-badge">Popular Upgrade</div>}*/}
            <div className="pricing-card-header">
              <h2 className="pricing-card-title">Pro Creator</h2>
              <div className="pricing-card-price">$49</div>
              <div className="pricing-card-period">per month</div>
            </div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item">
                <CheckIcon />
                <span><strong>Unlock all 7 Pro Templates</strong></span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon />
                <span>Custom Form Field Validation</span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon />
                <span>Unlimited Submissions Database</span>
              </li>
              <li className="pricing-feature-item" style={{ opacity: 0.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span>Unlock Premium Templates (Locked)</span>
              </li>
            </ul>
            <button
              className="pricing-action-btn btn-pro"
              onClick={() => handleSubscribe("PRO")}
              disabled={isSubmitting || currentPlan === "PRO"}
            >
              {currentPlan === "PRO" ? "Active" : "Subscribe to Pro"}
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className={`pricing-card premium-plan ${currentPlan === "PREMIUM" ? "active-plan" : ""}`}>
            {currentPlan === "PREMIUM" && <div className="active-badge" style={{ background: "#a855f7" }}>Current Plan</div>}
            <div className="pricing-card-header">
              <h2 className="pricing-card-title" style={{ color: "#a855f7" }}>Elite Premium</h2>
              <div className="pricing-card-price">$99</div>
              <div className="pricing-card-period">per month</div>
            </div>
            <ul className="pricing-features-list">
              <li className="pricing-feature-item">
                <CheckIcon color="#a855f7" />
                <span><strong>Unlock ALL 14 Templates (Pro + Premium)</strong></span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon color="#a855f7" />
                <span>Full Glassmorphic & Neon Themes</span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon color="#a855f7" />
                <span>Advanced Consultation Schedulers</span>
              </li>
              <li className="pricing-feature-item">
                <CheckIcon color="#a855f7" />
                <span>Priority Developer Customization</span>
              </li>
            </ul>
            <button
              className="pricing-action-btn btn-premium"
              onClick={() => handleSubscribe("PREMIUM")}
              disabled={isSubmitting || currentPlan === "PREMIUM"}
            >
              {currentPlan === "PREMIUM" ? "Active" : "Go Elite Premium"}
            </button>
          </div>
        </div>
        <div className="pricing-footer">
          <p>
            By proceeding with a subscription, you agree to our{" "}
            <a
              href="https://www.shopify.com/in/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="terms-link"
            >
              Terms of Service
            </a>
            . Subject to government tax and other prevailing charges.
          </p>
        </div>
      </div>
    </div>
  );
}
