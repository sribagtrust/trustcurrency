# 🚀 AWS DEPLOYMENT GUIDE - Trust Coin

## AWS Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │   S3 + CloudFront├───────→│ React Frontend   │               │
│  │  (Static Site)   │        │ dist/            │               │
│  └──────────────────┘        └──────────────────┘               │
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  EC2 / EB        ├───────→│  Node.js Backend │               │
│  │  (Compute)       │        │  Express Server  │               │
│  └──────────────────┘        └──────────────────┘               │
│         ↓                                ↓                        │
│  ┌──────────────────────────────────────────────┐               │
│  │     MongoDB Atlas (External)                 │               │
│  │  mongodb+srv://user:pass@cluster.mongodb.net│               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## AWS DEPLOYMENT OPTIONS

### Option 1: EC2 + S3 + CloudFront (Recommended for Full Control)
- **Backend**: EC2 instance running Node.js
- **Frontend**: S3 bucket + CloudFront CDN
- **Cost**: ~$10-30/month
- **Difficulty**: Medium

### Option 2: Elastic Beanstalk (Easier Management)
- **Backend**: Elastic Beanstalk environment
- **Frontend**: S3 + CloudFront
- **Cost**: ~$15-40/month
- **Difficulty**: Easy

### Option 3: Lambda + API Gateway (Serverless)
- **Backend**: AWS Lambda functions + API Gateway
- **Frontend**: S3 + CloudFront
- **Cost**: ~$5-15/month (pay per request)
- **Difficulty**: Hard

**→ We'll use Option 2 (Elastic Beanstalk) - Best balance of ease and control**

---

## ✅ PRE-AWS DEPLOYMENT CHECKLIST

### Backend
- [ ] `.env` configured with MongoDB Atlas URI
- [ ] PORT is set to 5000
- [ ] FRONTEND_URL set to your CloudFront domain (will be configured later)
- [ ] `package.json` has correct start script: `node Server.js`
- [ ] All dependencies listed in `package.json`
- [ ] `.gitignore` excludes `.env` and `node_modules/`

### Frontend
- [ ] `.env.production` configured with AWS backend API URL
- [ ] `npm run build` creates `dist/` folder successfully
- [ ] No hardcoded localhost URLs
- [ ] All API calls use `process.env.VITE_API_URL`

### AWS Prerequisites
- [ ] AWS account created
- [ ] AWS CLI installed: `pip install awscli-v2` or download from [aws.amazon.com/cli](https://aws.amazon.com/cli)
- [ ] AWS credentials configured: `aws configure`
- [ ] IAM user with permissions: EC2, S3, CloudFront, Elastic Beanstalk

---

## 📋 STEP 1: PREPARE BACKEND FOR AWS

### Update `.env` for AWS

Your current `.env` is already good:
```
MONGO_URI=mongodb://sribagtrust_db_user:your_password@cluster.mongodb.net/trust-coin?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=https://d123456.cloudfront.net  # Will update after CloudFront setup
NODE_ENV=production
```

### Verify `package.json` Scripts

```json
{
  "scripts": {
    "start": "node Server.js",
    "dev": "node Server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

✅ **Your `package.json` is correct**

### Test Build Locally
```bash
cd backend
npm install
npm start
# Should output: Server is running on port 5000
```

---

## 🎨 STEP 2: PREPARE FRONTEND FOR AWS

### Update `.env.production`

Create with your AWS backend URL (update after EB deployment):

```
VITE_API_URL=http://trust-coin-env.elasticbeanstalk.com
```

### Build for Production
```bash
cd frontend
npm run build
# Creates 'dist/' folder with optimized build
```

### Test Build
```bash
npm run preview
# Opens http://localhost:4173 with production build
```

---

## ☁️ STEP 3: DEPLOY BACKEND TO ELASTIC BEANSTALK

### 3.1 Install AWS EB CLI
```bash
pip install awsebcli
# or
brew install awsebcli  # macOS
```

### 3.2 Initialize EB Application
```bash
cd backend
eb init -p node.js-22 trust-coin-api --region us-east-1
```

Prompts:
- Application name: `trust-coin-api`
- Environment: `trust-coin-env`
- Region: `us-east-1` (or your preferred)

### 3.3 Create `.ebextensions` Configuration
Create folder: `backend/.ebextensions/`

Create file: `backend/.ebextensions/nodecommand.config`
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node Server.js"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: "production"
```

### 3.4 Configure Environment Variables
```bash
cd backend
eb setenv \
  MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/trust-coin?retryWrites=true&w=majority" \
  JWT_SECRET="your_strong_jwt_secret_here" \
  FRONTEND_URL="https://your-cloudfront-domain.com" \
  PORT=5000 \
  NODE_ENV=production
```

### 3.5 Deploy to EB
```bash
cd backend
eb create trust-coin-env --instance-type t3.micro
# Wait 5-10 minutes for deployment

# Check status
eb status

# View logs
eb logs
```

### 3.6 Get Your Backend URL
```bash
eb open
# This opens your live backend in browser
# URL will be: http://trust-coin-env.elasticbeanstalk.com
```

**Save this URL - you'll need it for frontend!**

---

## 📤 STEP 4: DEPLOY FRONTEND TO S3 + CLOUDFRONT

### 4.1 Create S3 Bucket
```bash
# Create bucket (must be globally unique)
aws s3 mb s3://trust-coin-frontend-prod

# Enable website hosting
aws s3 website s3://trust-coin-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

### 4.2 Upload Frontend Build
```bash
cd frontend

# Build production
npm run build

# Upload to S3
aws s3 sync dist/ s3://trust-coin-frontend-prod --delete
```

### 4.3 Create CloudFront Distribution

Using AWS Console:
1. Go to **CloudFront** → **Distributions** → **Create Distribution**
2. Configuration:
   - **Origin Domain**: `trust-coin-frontend-prod.s3.amazonaws.com`
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
   - **Cache Policy**: `CachingOptimized`
   - **Default Root Object**: `index.html`
   - **Error Pages**: Add custom error response
     - HTTP Error Code: `404`
     - Response Page Path: `/index.html`
     - HTTP Response Code: `200`

3. Click **Create Distribution**
4. Wait 10-15 minutes for deployment
5. Your CloudFront URL: `https://dxxxxxx.cloudfront.net`

### 4.4 Update Backend CORS
Now that you have your CloudFront domain, update backend:

```bash
cd backend
eb setenv FRONTEND_URL="https://dxxxxxx.cloudfront.net"
eb deploy
```

### 4.5 Update Frontend API URL
Update `frontend/.env.production`:

```
VITE_API_URL=http://trust-coin-env.elasticbeanstalk.com
```

Rebuild and redeploy:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://trust-coin-frontend-prod --delete
```

---

## 🧪 TESTING

### Test Backend
```bash
curl http://trust-coin-env.elasticbeanstalk.com/
# Response: "TrustCoin API is running!"
```

### Test Frontend
```bash
# Open in browser
https://dxxxxxx.cloudfront.net
```

### Test API Communication
1. Open frontend at CloudFront URL
2. Open DevTools → Network tab
3. Try login
4. Check API calls go to EB backend
5. Verify no CORS errors

---

## 📊 AWS COST ESTIMATION

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Elastic Beanstalk (t3.micro) | Free or ~$0.35/day | $10-12 |
| S3 Storage | First 1GB free, then $0.023/GB | ~$1-5 |
| CloudFront | 1GB/month free, then $0.085/GB | ~$5-10 |
| Data Transfer | Free (within region) | $0 |
| **Total** | | **~$15-30/month** |

---

## 🔧 USEFUL AWS CLI COMMANDS

### Elastic Beanstalk
```bash
# View environment status
eb status

# View logs
eb logs -a

# SSH into instance
eb ssh

# Deploy code
eb deploy

# Update environment variables
eb setenv KEY=VALUE

# Scale instances
eb scale 2  # Scale to 2 instances

# Terminate environment
eb terminate trust-coin-env
```

### S3
```bash
# List buckets
aws s3 ls

# Sync local folder to S3
aws s3 sync dist/ s3://bucket-name --delete

# Remove all objects from bucket
aws s3 rm s3://bucket-name --recursive

# Delete bucket
aws s3 rb s3://bucket-name
```

### CloudFront
```bash
# List distributions
aws cloudfront list-distributions

# Invalidate cache (after uploading new files)
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*"
```

---

## 🚨 TROUBLESHOOTING

### Backend Won't Start
```bash
eb logs -a
# Check for error messages in logs

# SSH into instance
eb ssh
# Then run: cat /var/log/eb-engine.log
```

### CORS Still Failing
1. Check `FRONTEND_URL` environment variable on EB
2. Ensure CloudFront domain is correct
3. Verify `Server.js` CORS configuration:
   ```javascript
   origin: (origin, callback) => {
     if (!origin || allowedOrigins.includes(origin)) {
       callback(null, true);
     }
   }
   ```

### Frontend Can't Reach Backend
1. Verify API URL in `.env.production`
2. Rebuild frontend: `npm run build`
3. Redeploy to S3: `aws s3 sync dist/ s3://bucket-name --delete`
4. Invalidate CloudFront cache (see CLI commands above)

### 404 Errors on Frontend Routes
- CloudFront is configured with custom error handling
- Should automatically redirect 404 to index.html for SPA routing

---

## 🔒 SECURITY FOR AWS DEPLOYMENT

### Protect S3 Bucket
```bash
# Block public access to sensitive files
aws s3api put-public-access-block \
  --bucket trust-coin-frontend-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Enable HTTPS
- CloudFront automatically uses HTTPS ✅
- Request certificate from AWS Certificate Manager (free) ✅

### Secure MongoDB Connection
- Already using MongoDB Atlas (external) ✅
- Connection uses SSL/TLS ✅
- Password in environment variables (not in code) ✅

### Environment Variables
- Store all secrets in EB environment variables ✅
- Never commit `.env` files to GitHub ✅
- Use IAM roles for AWS resource access ✅

---

## 📈 MONITORING & MAINTENANCE

### CloudWatch Logs
```bash
# View backend logs
eb logs --stream
```

### Monitor Performance
1. Go to **Elastic Beanstalk** → **Environment** → **Monitoring**
2. Check:
   - CPU Utilization
   - Network Traffic
   - Instance Health

### Auto-Scaling (Optional)
```bash
eb scale 2  # Scale to 2 instances
eb config   # Edit environment configuration
```

### Regular Updates
```bash
# Update backend code
cd backend
git pull
eb deploy

# Update frontend
cd frontend
npm run build
aws s3 sync dist/ s3://bucket-name --delete
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*"
```

---

## ✅ DEPLOYMENT COMPLETE CHECKLIST

- [ ] Backend deployed to Elastic Beanstalk
- [ ] Frontend deployed to S3 + CloudFront
- [ ] Environment variables configured on EB
- [ ] CORS configured for CloudFront domain
- [ ] Frontend API URL points to EB backend
- [ ] Backend is reachable at EB URL
- [ ] Frontend is reachable at CloudFront URL
- [ ] Login works without CORS errors
- [ ] Transactions execute successfully
- [ ] CloudWatch logs configured
- [ ] MongoDB Atlas accessible from EB

---

## 📞 NEXT STEPS

1. **Set up AWS account** (if not already done)
2. **Install AWS CLI and EB CLI**
3. **Update `.ebextensions` in backend**
4. **Deploy backend to Elastic Beanstalk** (~5 mins)
5. **Build frontend**: `npm run build` (~2 mins)
6. **Create S3 bucket and upload** (~2 mins)
7. **Create CloudFront distribution** (~15 mins)
8. **Update CORS and API URLs** (~2 mins)
9. **Test production deployment** (~5 mins)

**Total Time: ~30 minutes**

---

## 🔗 AWS DOCUMENTATION

- [Elastic Beanstalk Node.js](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-nodejs.html)
- [S3 Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront](https://docs.aws.amazon.com/cloudfront/latest/developerguide/Introduction.html)
- [AWS CLI Commands](https://docs.aws.amazon.com/cli/latest/reference/)

---

**Status**: ✅ Ready for AWS Deployment  
**Last Updated**: March 28, 2026
