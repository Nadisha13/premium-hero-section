import prisma from "../db.server";

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
    const customization = await prisma.customizedTemplate.findUnique({
      where: {
        shop_templateId: {
          shop,
          templateId,
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true, customization }),
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

