import prisma from "../db.server";

export const loader = async () => {
  let dbStatus = "disconnected";
  try {
    // Simple query to check database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    console.error("Database health check failed:", error);
    dbStatus = "error";
  }

  return new Response(
    JSON.stringify({
      status: "ok",
      environment: process.env.NODE_ENV || "unknown",
      appUrl: process.env.SHOPIFY_APP_URL || "unknown",
      database: dbStatus,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
