import { useState, useEffect } from "react";
import { useLoaderData, Link, useLocation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { TEMPLATES } from "../data/templates";
import "../styles/dashboard.css";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { isBillingTestMode } from "../billing.server";
import { syncPlanToMetafield } from "../utils/metafields.server";

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const loader = async ({ request }) => {
  try {
    console.log(`[loader:app._index.jsx] Authenticating request: ${request.url}`);
    const { session, billing, admin } = await authenticate.admin(request);
    const shop = session.shop;
    console.log(`[loader:app._index.jsx] Authenticated successfully. Shop: ${shop}`);
 
    // Query Shopify Billing API to check active subscriptions
    console.log(`[loader:app._index.jsx] Checking billing status for shop: ${shop}`);
    const billingCheck = await billing.check({
      plans: ["Pro Plan", "Elite Plan"],
      isTest: isBillingTestMode(shop),
    });
 
    let activePlan = "FREE";
    const subscriptions = billingCheck.appSubscriptions || (billingCheck.appSubscription ? [billingCheck.appSubscription] : []);
    if (billingCheck.hasActivePayment && subscriptions.length > 0) {
      const activeSub = subscriptions.find(sub => sub.status === "ACTIVE");
      if (activeSub) {
        if (activeSub.name === "Pro Plan") {
          activePlan = "PRO";
        } else if (activeSub.name === "Elite Plan") {
          activePlan = "PREMIUM";
        }
      }
    }
    console.log(`[loader:app._index.jsx] Shopify billing plan detected: ${activePlan}`);
 
    // Sync database subscription status
    console.log(`[loader:app._index.jsx] Syncing subscription status in database for ${shop}`);
    const dbSubscription = await prisma.shopSubscription.upsert({
      where: { shop },
      update: { plan: activePlan },
      create: { shop, plan: activePlan },
    });
 
    // Sync to Shopify AppInstallation Metafield
    console.log(`[loader:app._index.jsx] Syncing plan to Shopify metafield for ${shop}`);
    await syncPlanToMetafield(admin, activePlan);
 
    const url = new URL(request.url);
    const upgraded = url.searchParams.get("upgraded") === "true";
 
    return {
      plan: dbSubscription.plan,
      shop,
      upgraded,
    };
  } catch (error) {
    const isResponse = error instanceof Response || (error && typeof error.status === "number");
    if (isResponse) {
      console.log(`[loader:app._index.jsx] Redirect or expected auth Response thrown (status: ${error.status || 'unknown'}). Re-throwing.`);
      throw error;
    }
    console.error("🚨 Detailed Dashboard Loader Error:", error);
    if (error && typeof error === "object") {
      console.error("Error name/message:", error.name, "-", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Response(JSON.stringify({ 
      error: "Failed to load dashboard",
      details: error?.message || "Unknown error during dashboard load",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export default function DashboardPage() {
  const { plan, upgraded } = useLoaderData();
  const [selectedBrand, setSelectedBrand] = useState("all");
  const shopify = useAppBridge();
  const location = useLocation();

  useEffect(() => {
    if (upgraded) {
      const msg = plan === "PREMIUM"
        ? "🎉 Elite Plan activated successfully"
        : "🎉 Pro Plan activated successfully";
      shopify.toast.show(msg);
    }
  }, [upgraded, plan, shopify]);

  const brands = [
    { id: "all", name: "All Categories" },
    { id: "fashion", name: "Fashion" },
    { id: "jewelry", name: "Jewelry" },
    { id: "tech", name: "Tech" },
    { id: "skincare", name: "Skincare" },
    { id: "gym", name: "Gym" },
    { id: "coffee", name: "Coffee" },
    { id: "furniture", name: "Furniture" }
  ];

  // Logic to determine if a template is unlocked based on active subscription
  const isTemplateUnlocked = (templateTier) => {
    if (templateTier === "free") return true;
    if (plan === "PREMIUM") return true;
    if (plan === "PRO" && templateTier === "pro") return true;
    return false;
  };

  const filteredTemplates = selectedBrand === "all"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.brand === selectedBrand);

  // eslint-disable-next-line react/prop-types
  const LockIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const UnlockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor" />
      <path d="M17 11V7C17 4.23858 14.7614 2 12 2C9.6465 2 7.6433 3.6262 7.1245 5.8M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div>
      <div className="dashboard-container">

        {/* Subscription Info Banner */}
        <div className="sub-banner">
          <div className="sub-banner-content">
            <h2>
              Active Subscription:
              <span className={`plan-badge ${plan.toLowerCase()}`}>
                {plan} Plan
              </span>
            </h2>
            <p>
              {plan === "FREE" && "Subscribe to Pro or Premium to unlock conversion-focused layouts."}
              {plan === "PRO" && "Pro level active. All Pro templates are fully unlocked!"}
              {plan === "PREMIUM" && "Premium level active. You have full unlimited access to every design!"}
            </p>
          </div>
          <div className="sub-banner-action">
            <Link to={`/app/pricing${location.search}`}>
              <button className="btn-upgrade">
                {plan === "PREMIUM" ? "Manage Subscription" : "Upgrade Plan"}
              </button>
            </Link>
          </div>
        </div>

        {/* Brand Filters */}
        <div className="category-filters">
          {brands.map(brand => (
            <button
              key={brand.id}
              className={`category-btn ${selectedBrand === brand.id ? "active" : ""}`}
              onClick={() => setSelectedBrand(brand.id)}
            >
              {brand.name}
            </button>
          ))}
        </div>

        {/* Templates Grid (3 items per row) */}
        <div className="templates-grid">
          {filteredTemplates.map(tpl => {
            const unlocked = isTemplateUnlocked(tpl.tier);
            return (
              <div key={tpl.id} className="template-card">

                {/* Visual Preview Box */}
                <Link to={`/app/templates/${tpl.id}${location.search}`} style={{ textDecoration: "none", display: "block" }}>
                  <div className={`template-visual-preview tier-${tpl.tier}`}>
                    {tpl.tier === 'premium' && tpl.video ? (
                      <video 
                        className="template-media-bg" 
                        src={tpl.video} 
                        poster={tpl.image}
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                      />
                    ) : (
                      <img 
                        className="template-media-bg" 
                        src={tpl.image} 
                        alt={tpl.name} 
                      />
                    )}
                    
                    <div className="template-glass-overlay"></div>

                    {/* Lock/Unlock Badges */}
                    <span className={`template-badge badge-${tpl.tier}`}>
                      {tpl.tier}
                    </span>

                    {/* Lock overlay on hover for locked templates */}
                    {!unlocked && (
                      <div className="lock-overlay">
                        <div className="lock-icon-wrapper">
                          <LockIcon size={22} />
                        </div>
                        <span className="lock-overlay-text">Locked ({tpl.tier})</span>
                      </div>
                    )}

                    <div className="template-preview-content">
                      <div className="template-preview-tagline">
                        {tpl.tagline}
                      </div>
                      <div className="template-preview-sub">
                        {tpl.name} Form Layout
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Card Details */}
                <div className="template-details">
                  <span className="template-brand-name">{tpl.brand}</span>
                  <Link to={`/app/templates/${tpl.id}${location.search}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 className="template-card-title" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#38bdf8"} onMouseOut={(e) => e.currentTarget.style.color = "inherit"}>
                      {tpl.name}
                    </h3>
                  </Link>
                  <p className="template-card-description">{tpl.description}</p>

                  <div className="template-card-footer">
                    {unlocked ? (
                      <span className="template-card-unlocked">
                        <UnlockIcon /> Unlocked
                      </span>
                    ) : (
                      <span className="template-card-locked">
                        <LockIcon size={14} /> Locked
                      </span>
                    )}

                    <Link to={`/app/templates/${tpl.id}${location.search}`} className="template-action-link">
                      Preview Design &rarr;
                    </Link>
                  </div>
                </div>


              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
