import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5000;

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
) {
  addDocumentResponseHeaders(request, responseHeaders);

  // Extract dynamic frame-ancestors set by Shopify, fallback if not found
  const shopifyCsp = responseHeaders.get("Content-Security-Policy") || "";
  let frameAncestors = "frame-ancestors https://admin.shopify.com https://*.myshopify.com";
  const match = shopifyCsp.match(/frame-ancestors\s+[^;]+/);
  if (match) {
    frameAncestors = match[0];
  }

  // Shopify Embedded App CSP Fix with dynamic frame-ancestors
  // Allow wss: for WebSocket connections and allow 'unsafe-eval' for App Bridge
  // Disable HMR WebSocket errors by not enforcing strict WebSocket CSP
  responseHeaders.set(
    "Content-Security-Policy",
    `
      ${frameAncestors};
      default-src 'self' https:;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com;
      style-src 'self' 'unsafe-inline' https:;
      img-src 'self' data: https:;
      connect-src 'self' https: wss: ws: blob:;
      font-src 'self' https: data:;
      frame-src 'self' https:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `
      .replace(/\s+/g, " ")
      .trim(),
  );

  // Extra headers for embedded Shopify apps
  responseHeaders.set(
    "Access-Control-Allow-Origin",
    "https://admin.shopify.com",
  );

  responseHeaders.set(
    "Access-Control-Allow-Credentials",
    "true",
  );

  responseHeaders.set(
    "Access-Control-Allow-Private-Network",
    "true",
  );

  // Prevent frame busting and ensure proper frame embedding
  responseHeaders.set(
    "X-Frame-Options",
    "SAMEORIGIN",
  );

  const userAgent = request.headers.get("user-agent");

  const callbackName = isbot(userAgent ?? "")
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
      />,
      {
        [callbackName]: () => {
          const body = new PassThrough();

          const stream =
            createReadableStreamFromReadable(body);

          responseHeaders.set(
            "Content-Type",
            "text/html",
          );

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },

        onShellError(error) {
          reject(error);
        },

        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}