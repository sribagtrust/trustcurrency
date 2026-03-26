# Pre-Deployment Checklist

## ✅ Backend Ready?

- [ ] `Server.js` uses `process.env.PORT`
- [ ] `Server.js` uses `process.env.FRONTEND_URL` for CORS
- [ ] `Server.js` uses `process.env.MONGO_URI` for database
- [ ] `Server.js` uses `process.env.JWT_SECRET` for authentication
- [ ] `package.json` has `"start": "node Server.js"` script
- [ ] `.env.example` file exists with all required variables
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] All hardcoded URLs removed from backend code
- [ ] All dependencies in `package.json`

## ✅ Frontend Ready?

- [ ] All API calls use `apiClient` from `utils/apiClient.js`
- [ ] `apiClient.js` exists and uses `VITE_API_URL`
- [ ] `package.json` has `"build": "vite build"` script
- [ ] `.env.example` file exists with `VITE_API_URL`
- [ ] `.gitignore` includes `.env`
- [ ] `vite.config.js` has build optimization settings
- [ ] No hardcoded `localhost` URLs in components
- [ ] All `axios` imports replaced with `apiClient`
- [ ] All dependencies in `package.json`

## ✅ Environment Variables

### Backend Variables
- [ ] `MONGO_URI` - MongoDB connection string ready
- [ ] `JWT_SECRET` - Secure key generated
- [ ] `FRONTEND_URL` - Will be set after frontend deployment
- [ ] `PORT` - Set to 10000 for Render

### Frontend Variables
- [ ] `VITE_API_URL` - Will be set to backend Render URL

## ✅ Git & Repository

- [ ] All changes committed
- [ ] `.env` files NOT committed
- [ ] `.env.example` files INCLUDED
- [ ] No sensitive data in code
- [ ] Latest code pushed to main branch
- [ ] GitHub repository connected to Render

## ✅ MongoDB Setup

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with strong password
- [ ] Connection string obtained (includes user, password, hosts)
- [ ] IP whitelist allows Render (0.0.0.0 or specific IPs)
- [ ] Test connection locally with MongoDB Compass

## ✅ Render.com Setup

### Backend Service
- [ ] Service name: `trust-coin-api`
- [ ] Environment: Node
- [ ] Build: `cd backend && npm install`
- [ ] Start: `cd backend && npm start`
- [ ] Environment variables set
- [ ] Deployment successful

### Frontend Service
- [ ] Service name: `trust-coin-frontend`
- [ ] Environment: Node
- [ ] Build: `cd frontend && npm install && npm run build`
- [ ] Start: `cd frontend && npm run preview`
- [ ] Publish directory: `frontend/dist`
- [ ] Environment variables set
- [ ] Deployment successful

## ✅ Post-Deployment Testing

- [ ] Frontend loads without errors
- [ ] Navigation between pages works
- [ ] Register page loads and submits
- [ ] Login works after registration
- [ ] Dashboard displays user data
- [ ] API calls succeed (check Network tab)
- [ ] No CORS errors in console
- [ ] Admin dashboard accessible
- [ ] "No EADDRINUSE" errors in backend logs
- [ ] "Cannot GET /" doesn't appear

## ✅ Production URLs Verified

- [ ] Backend URL in Render: `https://trust-coin-api.onrender.com`
- [ ] Frontend URL in Render: `https://trust-coin-frontend.onrender.com`
- [ ] Backend `FRONTEND_URL` updated to match frontend URL
- [ ] Frontend `VITE_API_URL` updated to match backend URL
- [ ] Both services redeployed after URL updates

## ✅ Security Check

- [ ] `.env` files not committed to GitHub
- [ ] No hardcoded passwords in code
- [ ] JWT_SECRET is unique and secure
- [ ] MongoDB password is strong
- [ ] CORS only allows your frontend domain
- [ ] No console.log with sensitive data

## ✅ Troubleshooting Prepared

- [ ] Browser console checked for errors (F12)
- [ ] Render logs checked for deployment issues
- [ ] Network tab shows successful API calls
- [ ] Local npm install works (`npm install`)
- [ ] Local `npm run build` succeeds (frontend)
- [ ] Backend starts without errors locally

## 🚀 Deployment Day

1. **Final Git Push**
   ```bash
   git add .
   git commit -m "Final production deployment"
   git push origin main
   ```

2. **Check Each Service**
   - Backend health: `https://trust-coin-api.onrender.com/`
   - Frontend loads: `https://trust-coin-frontend.onrender.com`

3. **Quick Feature Test**
   - Try to register
   - Try to login
   - Check admin panel
   - Test a transaction

4. **Monitor for 24 Hours**
   - Watch for errors in Render logs
   - Check if services auto-restart properly
   - Verify no connection timeouts

## 📞 Support Resources

- **Documentation:** See `README.md` for detailed guide
- **Quick Guide:** See `DEPLOYMENT.md` for fast track
- **Troubleshooting:** See `README.md` > Troubleshooting section
- **Render Help:** https://render.com/docs
- **Vite Guide:** https://vitejs.dev/guide/

---

## 🎯 Critical URLs to Remember

After deployment, you'll have:

- **Backend API:** `https://trust-coin-api.onrender.com`
- **Frontend App:** `https://trust-coin-frontend.onrender.com`
- **Backend Logs:** Render Dashboard > trust-coin-api > Logs
- **Frontend Logs:** Render Dashboard > trust-coin-frontend > Logs

---

## 💡 Pro Tips

1. **Free tier limitation:** Render spins down free apps after 15 mins of inactivity. Upgrade for always-on servers.

2. **First deployment:** Takes 2-3 minutes. Subsequent deployments are faster.

3. **Database:** Keep MongoDB Atlas free cluster running. Check disk space monthly.

4. **Logs:** Check both frontend and backend logs when something goes wrong.

5. **Redeployment:** Just push to main branch and Render auto-deploys (if enabled).

---

**Status:** Ready to Deploy! ✅
