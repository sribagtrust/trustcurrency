# 🚀 PRODUCTION DEPLOYMENT GUIDE - Trust Coin

## ✅ PRE-DEPLOYMENT CHECKLIST

### Backend Requirements
- [ ] MongoDB Atlas cluster running and accessible
- [ ] IP whitelist includes Render's IP range (0.0.0.0/0 for testing)
- [ ] `.env` file configured with production values
- [ ] All API endpoints tested and working locally
- [ ] No console.log() statements left for sensitive data
- [ ] CORS configured for production frontend URL
- [ ] JWT_SECRET is strong and unique

### Frontend Requirements
- [ ] `.env.production` file created with production API URL
- [ ] No hardcoded localhost URLs
- [ ] API client uses environment variables
- [ ] All linting errors resolved (`npm run lint`)
- [ ] No console.log() in production code
- [ ] All components tested locally

### General Requirements
- [ ] Node 22.x specified in `.nvmrc` and `package.json`
- [ ] `.gitignore` protects `.env` files
- [ ] `render.yaml` (if using) is configured
- [ ] Git repository is up to date

---

## 📋 BACKEND DEPLOYMENT (Node.js on Render)

### Step 1: Push Code to GitHub
```bash
cd backend
git add .
git commit -m "Production ready backend"
git push origin main
```

### Step 2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: trust-coin-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node Server.js`
   - **Node Version**: 22.x (in `.nvmrc`)

### Step 3: Set Environment Variables on Render
Go to Service Settings → Environment:

```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://trustcurrency-1.onrender.com
NODE_ENV=production
```

### Step 4: Deploy
- Render auto-deploys on git push
- Monitor logs in Render dashboard
- Expected output: `Successfully connected to the Trust Database`

### Step 5: Verify Backend
```bash
# Test API endpoint
curl https://trustcurrency.onrender.com/

# Response should be: "TrustCoin API is running!"
```

---

## 🎨 FRONTEND DEPLOYMENT (React on Render Static Site)

### Step 1: Update Frontend Environment Variables

**`.env.production`** (already created):
```
VITE_API_URL=https://trustcurrency.onrender.com
```

### Step 2: Push Code to GitHub
```bash
cd frontend
git add .
git commit -m "Production ready frontend"
git push origin main
```

### Step 3: Create Render Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Static Site**
3. Connect your GitHub repository
4. Configure:
   - **Name**: trust-coin-frontend
   - **Publish Directory**: `dist`
   - **Build Command**: `npm ci && npm run build`
   - **Node Version**: Use 22.x (in `.nvmrc`)

### Step 4: Set Environment Variables on Render
Go to Service Settings → Environment:

```
VITE_API_URL=https://trustcurrency.onrender.com
```

### Step 5: Deploy
- Render auto-deploys on git push
- Build will run and create `dist` folder
- Once complete, your site is live at: `https://trustcurrency-1.onrender.com`

### Step 6: Verify Frontend
- Open `https://trustcurrency-1.onrender.com` in browser
- You should see the login page
- Go to Network tab in DevTools to confirm API calls go to backend

---

## 🔗 CORS CONFIGURATION VERIFICATION

Your backend `Server.js` is already configured:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://trustcurrency-1.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
```

✅ **Already configured for production**

---

## 🧪 TESTING PROCEDURES

### Local Testing (Before Deployment)
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Output: Server is running on port 5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Output: http://localhost:5174

# Terminal 3: Test
curl http://localhost:5000/  # Should return "TrustCoin API is running!"
```

### Production Testing (After Deployment)

**1. Backend Health Check**
```bash
curl https://trustcurrency.onrender.com/
# Expected: "TrustCoin API is running!"
```

**2. Frontend Load**
- Open `https://trustcurrency-1.onrender.com` in browser
- Should load without errors
- Check browser Console for any errors

**3. API Communication**
- Navigate to Login page
- Open Developer Tools → Network tab
- Try to login
- Verify requests go to `https://trustcurrency.onrender.com/api/auth/login`
- Should NOT see CORS errors

**4. Full Workflow Test**
- [ ] Register new account
- [ ] Login with credentials
- [ ] View dashboard
- [ ] Request recharge
- [ ] Transfer funds
- [ ] View transaction history

---

## 📊 CURRENT CONFIGURATION STATUS

### ✅ Backend
- Node 22.x configured in `package.json` and `.nvmrc`
- CORS configured for production URLs
- Environment variables in `.env`
- Build command: `npm install`
- Start command: `node Server.js`
- Database: MongoDB Atlas (connected)

### ✅ Frontend
- `.env.production` created with production API URL
- `npm run build` creates optimized `dist` bundle
- Vite configured for production (minified, no sourcemaps)
- All API calls use `apiClient` with environment variables
- No hardcoded URLs

### ✅ Infrastructure
- GitHub repository configured for auto-deploy
- Render services ready (create services and add env vars)
- MongoDB Atlas cluster configured
- JWT secret configured

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: CORS Error on Frontend
**Solution**: Verify `FRONTEND_URL` in backend `.env` matches your frontend Render URL

### Issue: MongoDB Connection Error
**Solution**: 
1. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` or your IP)
2. Verify `MONGO_URI` is correct in `.env`
3. Ensure cluster is running (not paused)

### Issue: 404 on Frontend Routes
**Solution**: Render static site needs rewrite rules. Configure:
- Rewrite rule: `/*` → `index.html` (for SPA routing)

### Issue: Frontend Can't Reach Backend
**Solution**:
1. Verify `VITE_API_URL` in `.env.production`
2. Ensure backend URL is correct in frontend env vars
3. Check backend is deployed and running on Render

---

## 📈 PERFORMANCE OPTIMIZATION

### Frontend Build Optimization
- Vite automatically code-splits React components
- Production build is minified (terser)
- No source maps in production
- Static files cached automatically

### Backend Optimization
- Use `npm ci` instead of `npm install` in CI/CD (faster)
- MongoDB queries are indexed (check models)
- CORS preflight requests are minimal
- Compression middleware ready for implementation

---

## 🔒 SECURITY CHECKLIST

- [ ] JWT_SECRET is unique and strong (>32 characters)
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] No API keys exposed in frontend code
- [ ] CORS only allows production URLs
- [ ] MongoDB password is strong
- [ ] Render environment variables are set (not in code)
- [ ] No console.log() with sensitive data
- [ ] HTTPS enforced (automatic on Render)

---

## 📞 DEPLOYMENT SUMMARY

| Component | Environment | URL |
|-----------|-------------|-----|
| Backend API | Render Web Service | `https://trustcurrency.onrender.com` |
| Frontend | Render Static Site | `https://trustcurrency-1.onrender.com` |
| Database | MongoDB Atlas | Configured in `MONGO_URI` |
| Repository | GitHub | Ready for auto-deploy |

---

## ✅ NEXT STEPS

1. **Create Backend Service on Render** (10 mins)
2. **Create Frontend Service on Render** (10 mins)  
3. **Set Environment Variables** (5 mins)
4. **Test Production URLs** (5 mins)
5. **Monitor Logs** (ongoing)

**Total Time to Production: ~30 minutes**

---

## 📚 USEFUL LINKS

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: March 28, 2026  
**Status**: ✅ Production Ready
