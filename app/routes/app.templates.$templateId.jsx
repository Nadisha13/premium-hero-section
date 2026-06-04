import { useState, useEffect } from "react";
import { useLoaderData, useActionData, useSubmit, useNavigation, Link, useLocation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { TEMPLATES } from "../data/templates";
import "../styles/premium-templates.css";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { isBillingTestMode } from "../billing.server";
import { syncPlanToMetafield } from "../utils/metafields.server";

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const loader = async ({ params, request }) => {
  try {
    console.log(`[loader:app.templates.$templateId.jsx] Authenticating request: ${request.url}`);
    const { session, billing, admin } = await authenticate.admin(request);
    const shop = session.shop;
    console.log(`[loader:app.templates.$templateId.jsx] Authenticated successfully. Shop: ${shop}`);
 
    // Query Shopify Billing API to check active subscriptions
    console.log(`[loader:app.templates.$templateId.jsx] Checking billing status for shop: ${shop}`);
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
    console.log(`[loader:app.templates.$templateId.jsx] Shopify billing plan detected: ${activePlan}`);
 
    // Sync database subscription status
    console.log(`[loader:app.templates.$templateId.jsx] Syncing subscription status in database for ${shop}`);
    const dbSubscription = await prisma.shopSubscription.upsert({
      where: { shop },
      update: { plan: activePlan },
      create: { shop, plan: activePlan },
    });
 
    // Sync to Shopify AppInstallation Metafield
    console.log(`[loader:app.templates.$templateId.jsx] Syncing plan to Shopify metafield for ${shop}`);
    await syncPlanToMetafield(admin, activePlan);
 
    const { templateId } = params;
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Response("Template Not Found", { status: 404 });
    }
 
    // Retrieve saved customizations if any
    console.log(`[loader:app.templates.$templateId.jsx] Retrieving customization for template: ${templateId}`);
    const customization = await prisma.customizedTemplate.findUnique({
      where: {
        shop_templateId: {
          shop,
          templateId,
        },
      },
    });
 
    return { 
      plan: dbSubscription.plan, 
      template, 
      shop,
      customization
    };
  } catch (error) {
    const isResponse = error instanceof Response || (error && typeof error.status === "number");
    if (isResponse) {
      console.log(`[loader:app.templates.$templateId.jsx] Redirect or expected auth Response thrown (status: ${error.status || 'unknown'}). Re-throwing.`);
      throw error;
    }
    console.error("🚨 Detailed Template Loader Error:", error);
    if (error && typeof error === "object") {
      console.error("Error name/message:", error.name, "-", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Response(JSON.stringify({ 
      error: "Failed to load template",
      details: error?.message || "Unknown error during template load",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const templateId = formData.get("templateId");

  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    return { error: "Template not found" };
  }

  if (actionType === "save") {
    // 1. Fetch user subscription status
    const subscription = await prisma.shopSubscription.findUnique({
      where: { shop },
    });
    const plan = subscription ? subscription.plan : "FREE";

    // 2. Validate template access permissions
    const unlocked = plan === "PREMIUM" || (plan === "PRO" && template.tier === "pro") || template.tier === "free";
    if (!unlocked) {
      return { error: `Plan upgrade required to save this design. This template is tier: ${template.tier.toUpperCase()}` };
    }

    const heading = formData.get("heading") || "";
    const description = formData.get("description") || "";
    const buttonText = formData.get("buttonText") || "";
    const image = formData.get("image") || "";
    const primaryColor = formData.get("primaryColor") || "";
    const secondaryColor = formData.get("secondaryColor") || "";

    const savedCustomization = await prisma.customizedTemplate.upsert({
      where: {
        shop_templateId: {
          shop,
          templateId,
        },
      },
      update: {
        heading,
        description,
        buttonText,
        image,
        primaryColor,
        secondaryColor,
      },
      create: {
        shop,
        templateId,
        heading,
        description,
        buttonText,
        image,
        primaryColor,
        secondaryColor,
      },
    });

    return { success: true, actionType: "save", savedCustomization };
  }

  return { success: false };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Template Action Error:", error);
    return { error: "An unexpected error occurred while saving" };
  }
};

export default function TemplateDetailPage() {
  const { plan, template, shop, customization } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();
  const shopify = useAppBridge();

  const isSaving = navigation.state === "submitting" && navigation.formData?.get("actionType") === "save";

  // Check if this template is unlocked under current plan
  const unlocked = plan === "PREMIUM" || (plan === "PRO" && template.tier === "pro") || template.tier === "free";

  // State bindings for customizer
  const [heading, setHeading] = useState(customization?.heading || template.tagline);
  const [description, setDescription] = useState(customization?.description || template.description);
  const [buttonText, setButtonText] = useState(customization?.buttonText || template.buttonText);
  const [image, setImage] = useState(customization?.image || template.image);
  const [primaryColor, setPrimaryColor] = useState(customization?.primaryColor || template.accentColor || "#64748b");
  const [secondaryColor, setSecondaryColor] = useState(customization?.secondaryColor || template.bgColor || "#ffffff");

  // Show Toast when saved successfully
  useEffect(() => {
    if (actionData?.success && actionData.actionType === "save") {
      shopify.toast.show("🎉 Template customizations saved successfully!");
    } else if (actionData?.error) {
      shopify.toast.show(`❌ ${actionData.error}`, { isError: true });
    }
  }, [actionData, shopify]);

  const handleSave = (e) => {
    e.preventDefault();
    submit({
      actionType: "save",
      templateId: template.id,
      heading,
      description,
      buttonText,
      image,
      primaryColor,
      secondaryColor
    }, { method: "post" });
  };

  // Image Presets for rapid testing
  const imagePresets = [
    { name: "Default", url: template.image },
    { name: "Fashion", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" },
    { name: "Tech", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" },
    { name: "Jewelry", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" },
    { name: "Skincare", url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80" },
    { name: "Gym", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
    { name: "Coffee", url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80" },
    { name: "Furniture", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80" }
  ];

  const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const shopName = shop.replace(".myshopify.com", "");
  const themeEditorUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor`;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b0f19", color: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. Customizer Panel (Left) */}
      <div style={{
        width: "420px",
        background: "rgba(15, 23, 42, 0.95)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxSizing: "border-box",
        backdropFilter: "blur(20px)",
        height: "100vh",
        overflowY: "auto",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div>
          <Link to={`/app${location.search}`} style={{
            color: "#38bdf8",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginBottom: "1rem"
          }}>
            &larr; Back to Template Gallery
          </Link>
          <h2 style={{ fontSize: "1.4rem", margin: 0, fontWeight: "800", color: "#f8fafc" }}>
            Template Customizer
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            Customize and save settings to see them live on your store.
          </p>
        </div>

        {/* How merchants use this template panel */}
        <div style={{
          background: "rgba(56, 189, 248, 0.06)",
          border: "1px solid rgba(56, 189, 248, 0.15)",
          borderRadius: "8px",
          padding: "1rem"
        }}>
          <h3 style={{ fontSize: "0.85rem", margin: "0 0 0.5rem 0", color: "#38bdf8", fontWeight: "700" }}>
            How Merchants Use This Template
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.75rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <li><strong>1. Customize:</strong> Modify heading, description, CTA button, colors & imagery below.</li>
            <li><strong>2. Save Settings:</strong> Click "Save Template" to store in database.</li>
            <li><strong>3. Add Block:</strong> Click "Apply to Theme" to open Shopify's Editor.</li>
            <li><strong>4. Dynamic Sync:</strong> The App Block automatically retrieves your saved settings.</li>
          </ul>
        </div>

        {!unlocked && (
          <div style={{
            background: "rgba(217, 119, 6, 0.1)",
            border: "1px solid rgba(217, 119, 6, 0.2)",
            borderRadius: "8px",
            padding: "1rem",
            color: "#f59e0b",
            fontSize: "0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "700" }}>
              <LockIcon /> Locked Template
            </div>
            <span>You need a Pro or Premium plan to publish this design to your online store.</span>
            <Link to={`/app/pricing${location.search}`}>
              <button style={{
                background: "#d97706",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%"
              }}>
                Upgrade Subscription
              </button>
            </Link>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>Hero Heading</label>
            <textarea
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                color: "white",
                padding: "0.6rem 0.8rem",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "60px"
              }}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Enter hero main heading..."
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>Hero Description</label>
            <textarea
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                color: "white",
                padding: "0.6rem 0.8rem",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "80px"
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description tagline..."
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>CTA Button Text</label>
            <input
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                color: "white",
                padding: "0.6rem 0.8rem",
                fontSize: "0.9rem"
              }}
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Use Premium Template"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>Background Image URL</label>
            <input
              style={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                color: "white",
                padding: "0.6rem 0.8rem",
                fontSize: "0.9rem",
                marginBottom: "0.4rem"
              }}
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Or select a template preset:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.2rem" }}>
              {imagePresets.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  style={{
                    background: image === preset.url ? "#38bdf8" : "rgba(255, 255, 255, 0.08)",
                    color: image === preset.url ? "#0f172a" : "white",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>Primary Accent</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  style={{
                    border: "none",
                    background: "none",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    padding: 0
                  }}
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>{primaryColor}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>Background Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  style={{
                    border: "none",
                    background: "none",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    padding: 0
                  }}
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
                <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>{secondaryColor}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                background: isSaving ? "rgba(56, 189, 248, 0.4)" : "#38bdf8",
                color: "#0f172a",
                border: "none",
                padding: "0.85rem",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
            >
              {isSaving ? "Saving Settings..." : "Save Template Settings"}
            </button>

            {unlocked && (
              <a
                href={themeEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  padding: "0.8rem",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                Apply to Storefront Theme &rarr;
              </a>
            )}
          </div>
        </form>
      </div>

      {/* 2. Interactive Preview Frame (Right) */}
      <div style={{
        flex: 1,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxSizing: "border-box",
        height: "100vh",
        overflowY: "auto"
      }}>
        {/* Simulating Browser Frame */}
        <div style={{
          background: "#1e293b",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Browser Address Bar */}
          <div style={{
            background: "#0f172a",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
            </div>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "0.25rem 1rem",
              fontSize: "0.75rem",
              color: "#94a3b8",
              fontFamily: "monospace",
              textAlign: "center"
            }}>
              https://{shopName}.myshopify.com/apps/premium-hero-preview
            </div>
            <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>
              LIVE PREVIEW
            </div>
          </div>

          {/* Actual Preview Canvas */}
          <div style={{ flex: 1, position: "relative", minHeight: "600px", display: "flex", flexDirection: "column" }}>
            <div 
              className={`hero-template-wrapper tpl-${template.id}`} 
              style={{
                backgroundColor: secondaryColor,
                backgroundImage: `linear-gradient(135deg, ${secondaryColor} 0%, rgba(10,10,10,0.15) 100%)`,
                flex: 1,
                padding: "4rem 2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {/* Media Background */}
              {template.tier === "premium" && template.video ? (
                <video
                  className="hero-media-bg"
                  src={template.video}
                  poster={image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ opacity: 0.4 }}
                />
              ) : image ? (
                <img
                  className={`hero-media-bg ${template.tier === "pro" ? "pro-zoom" : ""}`}
                  src={image}
                  alt={`${template.name} preview`}
                  style={{ opacity: 0.4 }}
                />
              ) : null}

              {/* Cinematic Overlays */}
              <div className={`hero-media-overlay overlay-${template.tier}`}></div>

              {/* Centered Content */}
              <div className="hero-layout-content hero-layout-centered" style={{ zIndex: 10, position: "relative" }}>
                <div style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center" }}>
                  <h1 className="hero-tagline" style={{ color: primaryColor, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                    {heading}
                  </h1>
                  <p className="hero-description" style={{ textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}>
                    {description}
                  </p>

                  {/* Real Hero Section CTA Button (No forms) */}
                  <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center" }}>
                    <button 
                      style={{
                        background: primaryColor,
                        color: "white",
                        border: "none",
                        padding: "1rem 2.5rem",
                        borderRadius: "8px",
                        fontSize: "1.1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: `0 10px 25px rgba(0,0,0,0.4)`
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.5)`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 10px 25px rgba(0,0,0,0.4)`;
                      }}
                    >
                      {buttonText}
                    </button>
                  </div>
                  
                  {/* Features List */}
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem", marginTop: "3.5rem" }}>
                    {template.features.map((feat, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", opacity: 0.9 }}>
                        <span style={{ color: primaryColor, fontSize: "1.2rem" }}>&bull;</span> {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
