# Quick Deployment Guide - Render.com

## 🚀 Fast Track Deployment (5 minutes)

### Step 1: Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Backend Service on Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in these details:
   - **Name:** `trust-coin-api`
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or higher)

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGO_URI` = (your MongoDB Atlas connection string)
   - `JWT_SECRET` = (generate a secure key)
   - `FRONTEND_URL` = `https://trust-coin-frontend.onrender.com`

6. Click Deploy → Wait 2-3 minutes

### Step 3: Create Frontend Service on Render
1. Click "New +" → "Web Service"
2. Select the same repository
3. Fill in these details:
   - **Name:** `trust-coin-frontend`
   - **Environment:** Node
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Start Command:** `cd frontend && npm run preview`
   - **Publish Directory:** `frontend/dist`
   - **Plan:** Free (or higher)

4. Add Environment Variables:
   - `VITE_API_URL` = `https://trust-coin-api.onrender.com`

5. Click Deploy → Wait 2-3 minutes

### Step 4: Update Backend FRONTEND_URL
Once frontend is deployed and you have its URL:
1. Go to backend service settings
2. Update `FRONTEND_URL` with the actual deployed URL
3. Manual deploy

## ✅ What's Already Done

✅ Backend uses `process.env.PORT`
✅ CORS configured for production URLs
✅ All frontend API calls use environment variables
✅ `.env.example` files created for reference
✅ Build scripts configured in package.json
✅ `.gitignore` prevents committing secrets
✅ `render.yaml` ready for deployment

## 📋 Pre-Deployment Checklist

- [ ] MongoDB cluster created on MongoDB Atlas
- [ ] MongoDB IP whitelist includes Render (0.0.0.0 or specific IPs)
- [ ] All code committed and pushed to GitHub
- [ ] Backend `.env` not committed (check .gitignore)
- [ ] Frontend `.env` not committed (check .gitignore)

## 🔐 Important: Generate Secure JWT Secret

Use this command to generate a secure key:
```bash
# On Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Use this value for `JWT_SECRET` environment variable.

## 🌐 MongoDB Atlas Setup

1. Create account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create database user with strong password
4. Get connection string: Database → Connect → Drivers
5. Replace `<username>`, `<password>`, and `<dbname>` in the URI
6. Use this as `MONGO_URI` in both local and Render

## 📱 Testing After Deployment

1. Visit `https://trust-coin-frontend.onrender.com`
2. Try to register/login
3. Check browser console (F12) for any errors
4. Check Render logs if issues occur:
   - Backend: Click service → Logs
   - Frontend: Click service → Logs

## ⚠️ Common Issues

**Frontend shows blank page:**
- Check `VITE_API_URL` is correct in environment variables
- Check browser console for errors (F12)
- Hard refresh page (Ctrl+Shift+R)

**API calls fail with CORS error:**
- Check backend `FRONTEND_URL` matches your frontend URL
- Restart backend service after changing environment variable
- Check backend logs for CORS errors

**"Cannot find module" errors:**
- Backend: Make sure `npm install` ran successfully
- Check logs for missing dependencies
- Verify package.json includes all required packages

**Slow initial load (free tier):**
- Render spins down free services after inactivity
- First request takes ~30 seconds
- Upgrade to paid plan for better performance

## 📞 Next Steps

1. Monitor both services for errors in Render dashboard
2. Test all features:
   - Registration
   - Login
   - Dashboard
   - Transfers
   - Admin functions
3. Set up automatic deployments (optional):
   - Enable auto-deploy from main branch in Render settings
