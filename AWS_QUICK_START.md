# AWS QUICK START

## 🚀 Fast Track (5 minutes)

### 1. Install AWS Tools
```bash
# Install AWS CLI
pip install awscli-v2

# Install EB CLI
pip install awsebcli

# Configure AWS credentials
aws configure
```

### 2. Deploy Backend (5 minutes)
```bash
cd backend
eb init -p node.js-22 trust-coin-api --region us-east-1
eb create trust-coin-env --instance-type t3.micro
eb setenv MONGO_URI="your_mongodb_uri" JWT_SECRET="your_secret" FRONTEND_URL="https://cloudfront-domain"
```

**Get your backend URL:**
```bash
eb open --print-url
# Save this URL!
```

### 3. Deploy Frontend (5 minutes)
```bash
cd frontend
npm run build
aws s3 mb s3://trust-coin-frontend-prod
aws s3 sync dist/ s3://trust-coin-frontend-prod --delete
```

### 4. Create CloudFront (AWS Console)
1. Go to CloudFront
2. Create Distribution
3. Origin: Your S3 bucket
4. Default Root Object: `index.html`
5. Add error page: 404 → /index.html (200)

### 5. Update Backend CORS
```bash
cd backend
eb setenv FRONTEND_URL="https://your-cloudfront-domain.com"
eb deploy
```

### 6. Update Frontend API URL
Update `frontend/.env.production`:
```
VITE_API_URL=http://trust-coin-env.elasticbeanstalk.com
```

Rebuild and redeploy:
```bash
npm run build
aws s3 sync dist/ s3://trust-coin-frontend-prod --delete
```

---

## 📊 Estimated Cost
- **Elastic Beanstalk**: ~$10/month (t3.micro ~$0.35/day)
- **S3 Storage**: ~$1/month
- **CloudFront**: ~$5-10/month
- **Total**: ~$15-25/month

---

## 🔗 Useful Dashboards

- [Elastic Beanstalk](https://console.aws.amazon.com/elasticbeanstalk)
- [S3 Buckets](https://s3.console.aws.amazon.com/s3)
- [CloudFront Distributions](https://console.aws.amazon.com/cloudfront)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch)
- [EC2 Instances](https://console.aws.amazon.com/ec2)

---

## ❓ Need Help?

See detailed guide in `AWS_DEPLOYMENT.md`
