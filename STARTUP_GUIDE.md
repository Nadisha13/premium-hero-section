# 🚀 Premium Hero Section - Complete Startup Guide

## ✅ ALL FIXES APPLIED

### Critical Issues Fixed:

1. **✅ Same-Origin Policy Error (chrome-error)**
   - Fixed redirect logic in `app/pricing.jsx` to check for error state
   - Added safe redirect guard: `if (window.location.protocol !== "chrome-error:")`
   - Created error boundary component with recovery options

2. **✅ Billing Test Mode Disabled**
   - `app/routes/app._index.jsx` → `isTest: false`
   - `app/routes/app.templates.$templateId.jsx` → `isTest: false`
   - `app/routes/app.pricing.jsx` → `isTest: false` (all 3 locations)
   - `app/routes/app.billing.jsx` → `isTest: false`

3. **✅ React Router Redirect Issue**
   - `app/routes/app.billing.jsx` → Replaced React Router's `redirect()` with Shopify's `shopifyRedirect()`
   - Shopify redirect properly handles embedded app frame navigation

4. **✅ Hardcoded Production URL**
   - `app/routes/app.billing.jsx` → Removed hardcoded URL
   - Now dynamically generates return URL based on environment

5. **✅ CSP Headers**
   - `app/entry.server.jsx` → Added proper frame-src and X-Frame-Options
   - Enabled WebSocket connections (wss: and ws:)

6. **✅ Error Boundary**
   - Created `app/components/ErrorBoundary.jsx` with recovery UI
   - Added error detection script in `app/root.jsx`

---

## 🔧 STEP-BY-STEP STARTUP

### 1. Stop Everything
```bash
# Stop npm dev server (Ctrl+C)
# Stop Cloudflare tunnel (Ctrl+C)
```

### 2. Clear Cache & Session
```bash
# Clear browser cookies/cache for the app URL
# Or: Open app in Incognito window (Cmd+Shift+N on Mac, Ctrl+Shift+N on Windows)
```

### 3. Rebuild the App
```bash
npm run build
```

### 4. Start the Development Tunnel
```bash
# Option A: Cloudflare (recommended)
npx shopify app dev

# Option B: Ngrok
ngrok http 3000
# Then update SHOPIFY_APP_URL with ngrok URL

# Option C: Tunnelmole
npm install -g tunnelmole
tunnelmole 3000
```

**Expected Output:**
```
✅ Tunnel active at: https://xxx-xxx-xxx.trycloudflare.com
✅ App URL: https://xxx-xxx-xxx.trycloudflare.com
```

### 5. Verify in Shopify Admin

1. Open Shopify Admin
2. Go to: **Settings > Apps and integrations > Develop apps**
3. Click your app
4. Update **Admin API credentials redirect URLs** if prompted
5. Click **Install app** or **Go to app**

**Expected Flow:**
- ✅ Redirects to login page
- ✅ After login: redirects to dashboard
- ✅ Dashboard loads successfully

---

## 🧪 TESTING BILLING FLOW

### Test Scenario 1: Free → Pro Upgrade
1. Open app as FREE user
2. Click "Upgrade to Pro"
3. Should see Shopify billing confirmation
4. After approval: redirects to dashboard with "Plan Activated" toast

### Test Scenario 2: Pro → Premium Upgrade  
1. Open app as PRO user
2. Click "Upgrade to Elite"
3. Should see Shopify billing confirmation
4. After approval: shows all 14 templates

### Test Scenario 3: Connection Failure Recovery
1. Stop Cloudflare tunnel while on app
2. Should see: "⚠️ Connection Error" page
3. Click "🔄 Retry Connection"
4. App should recover when tunnel is restarted

---

## 🔍 DEBUGGING CHECKLIST

If you still see the chrome-error:// issue:

### A. Check Tunnel Status
```bash
# Verify tunnel is running
# Output should show: ✅ Tunnel active
```

### B. Verify Environment Variables
```bash
# Check these are set correctly:
echo $SHOPIFY_API_KEY
echo $SHOPIFY_API_SECRET  
echo $SCOPES
echo $HOST  # Should be your tunnel URL
```

### C. Check Browser Console
```
Open DevTools (F12)
Go to Console tab
Look for errors - should be empty
```

### D. Check Network Tab
```
Open DevTools (F12)
Go to Network tab
Reload page
All requests should be Status 200
No FAILED or CANCELED requests
```

### E. Check Application Storage
```
DevTools > Application > Cookies
Delete all cookies for your tunnel URL
Reload page
```

### F. Check App Bridge
```
Open DevTools Console
Type: window.shopify
Should show: Object { ... api, ...}
If undefined: iframe context issue
```

---

## 📝 Key Environment Variables

**Must be set in `.env` or `.env.local`:**
```
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SCOPES=write_metaobject_definitions,write_metaobjects,write_products
HOST=https://your-tunnel-url.trycloudflare.com
SHOPIFY_APP_URL=https://your-tunnel-url.trycloudflare.com (or leave empty if HOST is set)
DATABASE_URL=your_database_url
```

---

## 🛑 COMMON ERRORS & FIXES

### Error: "chrome-error://chromewebdata"
**Cause:** Tunnel disconnected or failed initial request
**Fix:** 
- Restart tunnel: `npx shopify app dev`
- Clear cookies (Incognito window)
- Check DevTools Network tab for 404/timeout

### Error: "Cross-Origin Request Blocked"
**Cause:** CSP headers too strict
**Fix:** Already fixed in entry.server.jsx
- Verify CSP headers: DevTools > Network > click request > Headers > CSP

### Error: "Session Not Found"
**Cause:** Database connection issue
**Fix:**
```bash
npm exec prisma migrate deploy
npm exec prisma generate
```

### Error: "Billing Check Failed"  
**Cause:** `isTest: true` in production or invalid Shopify credentials
**Fix:** Already fixed - all `isTest` set to `false`

### Error: "Redirect Not Working"
**Cause:** Wrong redirect function used
**Fix:** Already fixed
- app.billing.jsx: Now uses `shopifyRedirect()` not `redirect()`
- app.pricing.jsx: Now checks for error state before redirecting

---

## ✨ VALIDATION CHECKLIST

After startup, verify these work:

- [ ] ✅ App loads in Shopify Admin
- [ ] ✅ Dashboard displays 7 free/pro templates
- [ ] ✅ Click "Upgrade to Pro" → Shopify billing appears
- [ ] ✅ After upgrade → Database stores plan = "PRO"
- [ ] ✅ Click "Upgrade to Elite" → All 14 templates appear
- [ ] ✅ Pro user sees only 7 templates
- [ ] ✅ Premium user sees all 14 templates
- [ ] ✅ Billing page shows current plan highlighted
- [ ] ✅ Can select different plan without errors
- [ ] ✅ Tunnel disconnection shows error page with recovery button

---

## 📞 Need Help?

If issues persist:

1. **Check logs:**
   ```bash
   npm run build 2>&1 | tee build.log
   # Look for "error" in output
   ```

2. **Check database:**
   ```bash
   npm exec prisma studio
   # Verify shopSubscription records exist
   ```

3. **Test API endpoint:**
   ```bash
   curl "https://your-tunnel/apps/premium-hero-proxy?shop=test.myshopify.com&template_id=fashion-premium"
   # Should return JSON with unlocked status
   ```

4. **Restart everything:**
   ```bash
   # Kill all processes
   # Clear browser cache  
   # npx shopify app dev
   ```

---

## 🎉 You're All Set!

Your app should now:
- ✅ Handle connection errors gracefully
- ✅ Properly redirect after billing
- ✅ Show correct templates based on subscription
- ✅ Recover from tunnel disconnections

**Happy coding!** 🚀
