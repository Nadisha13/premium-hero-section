import prisma from "../db.server";
import { TEMPLATES } from "../data/templates";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const templateId = url.searchParams.get("template_id");

  if (!shop || !templateId) {
    return new Response(
      JSON.stringify({ error: "Missing shop or template_id parameter" }),
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // 1. Fetch template customizations
    const customization = await prisma.customizedTemplate.findUnique({
      where: {
        shop_templateId: {
          shop,
          templateId,
        },
      },
    });

    // 2. Query shop subscription level
    const subscription = await prisma.shopSubscription.findUnique({
      where: { shop },
    });
    const plan = subscription ? subscription.plan : "FREE";

    // 3. Find template and determine lock status
    const template = TEMPLATES.find(t => t.id === templateId);
    let unlocked = false;
    if (template) {
      if (template.tier === "free") {
        unlocked = true;
      } else if (plan === "PREMIUM") {
        unlocked = true;
      } else if (plan === "PRO" && template.tier === "pro") {
        unlocked = true;
      }
    }

    return new Response(
      JSON.stringify({ success: true, customization, unlocked, plan }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in App Proxy Loader:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const action = async () => {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    }
  );
};

