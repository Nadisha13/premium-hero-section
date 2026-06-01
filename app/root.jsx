import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./tailwind.css";
import { ErrorBoundary as ErrorBoundaryComponent } from "./components/ErrorBoundary";

export function ErrorBoundary() {
  return <ErrorBoundaryComponent />;
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <link rel="preconnect" href="https://cdn.shopify.com/" />

        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />

        {/* Script to prevent same-origin policy errors and handle WebSocket failures */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle chrome-error:// redirect
              if (window.location.protocol === 'chrome-error:') {
                setTimeout(() => {
                  window.location.replace('/');
                }, 100);
              }

              // Suppress WebSocket connection error logging
              // This prevents the "WebSocket connection failed" console error
              // when using Cloudflare tunnels without HMR
              if (typeof window !== 'undefined') {
                // Store original WebSocket constructor
                const OriginalWebSocket = window.WebSocket;
                
                // Override WebSocket to suppress specific errors
                window.WebSocket = class extends OriginalWebSocket {
                  constructor(url) {
                    super(url);
                    
                    // Handle connection failures gracefully
                    this.addEventListener('error', (event) => {
                      // Suppress errors for HMR and extension connections that fail
                      // These are expected to fail when using tunnels
                      if (url.includes('/extensions') || 
                          url.includes('__vite_ping') ||
                          url.includes('_next/webpack-hmr')) {
                        // Silently fail - don't propagate error
                        event.preventDefault();
                        return false;
                      }
                      // Allow other WebSocket errors to propagate
                    }, { once: false });
                  }
                };
              }

              // Disable auto-refresh on HMR failure
              if (window.location.hash !== '#no-hmr') {
                window.__HMR_DISABLE__ = true;
              }
            `,
          }}
        />

        <Meta />
        <Links />
      </head>

      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}