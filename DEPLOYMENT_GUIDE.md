# Production Deployment Guide

## Current Issue
Your frontend is deployed on Vercel and trying to access `/auth/login` but your backend API routes are prefixed with `/api` and deployed on Render.

## Solution

### 1. Set Environment Variables in Vercel

Go to your Vercel dashboard and set the following environment variable:

```
VITE_API_BASE=https://smart-helpdesk-lt3h.onrender.com/api
```

**Steps:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name:** `VITE_API_BASE`
   - **Value:** `https://smart-helpdesk-lt3h.onrender.com/api`
   - **Environment:** Production (and Preview if needed)
4. Save and redeploy

### 2. Alternative: Use Vercel Proxy (Recommended)

Instead of exposing your Render backend directly, create a proxy in Vercel:

#### Create `vercel.json` in your frontend root:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://smart-helpdesk-lt3h.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Requested-With"
        }
      ]
    }
  ]
}
```

Then set:
```
VITE_API_BASE=/api
```

### 3. Update Backend CORS (if needed)

Update your backend CORS configuration in `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://localhost:4173",
    "https://your-vercel-domain.vercel.app", // Add your Vercel domain
    "https://smart-helpdesk-lt3h.onrender.com" // Your Render domain
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};
```

### 4. Test the Fix

After deploying:

1. **Check environment variable:**
   ```javascript
   // In browser console on your Vercel site
   console.log(import.meta.env.VITE_API_BASE)
   ```

2. **Test API endpoint:**
   ```bash
   curl https://smart-helpdesk-lt3h.onrender.com/api/auth/login
   ```

3. **Check network tab** in browser dev tools to see if requests are going to the correct URL.

## Recommended Approach

**Use the Vercel proxy approach (#2)** because:
- Better security (backend not directly exposed)
- Better performance (same domain)
- Easier to manage
- No CORS issues

## Troubleshooting

### If still getting 404:
1. Check if your Render backend is running
2. Verify the URL is correct
3. Check Render logs for any errors
4. Ensure your backend routes are working locally

### If getting CORS errors:
1. Update CORS configuration in backend
2. Use the proxy approach instead
3. Check if preflight requests are handled

### If environment variable not working:
1. Redeploy after setting the variable
2. Check if the variable is set for the correct environment
3. Verify the variable name starts with `VITE_`

## Final Configuration

**For Vercel:**
- Environment Variable: `VITE_API_BASE=/api`
- Add `vercel.json` for proxy

**For Render:**
- Ensure backend is running
- Update CORS if needed
- Check logs for any startup errors
