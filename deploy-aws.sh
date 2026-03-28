#!/bin/bash

# Trust Coin AWS Deployment Script
# This script automates the deployment process to AWS Elastic Beanstalk + S3 + CloudFront

set -e  # Exit on error

echo "🚀 Trust Coin AWS Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install it first:${NC}"
    echo "   pip install awscli-v2"
    exit 1
fi

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo -e "${RED}❌ Elastic Beanstalk CLI not found. Install it first:${NC}"
    echo "   pip install awsebcli"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found${NC}"
echo ""

# Ask for deployment type
echo "🔧 Deployment Options:"
echo "1) Deploy Backend Only (Elastic Beanstalk)"
echo "2) Deploy Frontend Only (S3 + CloudFront)"
echo "3) Deploy Both (Backend + Frontend)"
read -p "Enter choice (1-3): " DEPLOY_CHOICE

# Backend deployment
deploy_backend() {
    echo ""
    echo -e "${YELLOW}📦 Deploying Backend to Elastic Beanstalk...${NC}"
    
    cd backend
    
    # Check if EB is initialized
    if [ ! -d ".elasticbeanstalk" ]; then
        echo "⚙️ Initializing Elastic Beanstalk..."
        read -p "Enter application name (default: trust-coin-api): " APP_NAME
        APP_NAME=${APP_NAME:-trust-coin-api}
        read -p "Enter AWS region (default: us-east-1): " REGION
        REGION=${REGION:-us-east-1}
        
        eb init -p node.js-22 $APP_NAME --region $REGION
    fi
    
    # Deploy
    echo "🚀 Deploying to Elastic Beanstalk..."
    eb deploy
    
    echo ""
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    
    # Get EB URL
    EB_URL=$(eb open --print-url)
    echo -e "Backend URL: ${GREEN}$EB_URL${NC}"
    
    echo "📝 Save this URL - you'll need it for the frontend!"
    
    cd ..
}

# Frontend deployment
deploy_frontend() {
    echo ""
    echo -e "${YELLOW}🎨 Deploying Frontend to S3 + CloudFront...${NC}"
    
    read -p "Enter S3 bucket name (e.g., trust-coin-frontend-prod): " BUCKET_NAME
    read -p "Enter CloudFront Distribution ID (if updating existing): " DISTRIBUTION_ID
    
    cd frontend
    
    echo "🏗️ Building frontend..."
    npm run build
    
    echo "📤 Checking if S3 bucket exists..."
    if ! aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
        echo "📁 Creating S3 bucket: $BUCKET_NAME"
        aws s3 mb "s3://$BUCKET_NAME" --region us-east-1
        
        echo "🌐 Enabling website hosting..."
        aws s3 website "s3://$BUCKET_NAME" \
            --index-document index.html \
            --error-document index.html
    fi
    
    echo "⬆️ Uploading files to S3..."
    aws s3 sync dist/ "s3://$BUCKET_NAME" --delete
    
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        echo "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo "S3 Bucket: $BUCKET_NAME"
    echo "To set up CloudFront, visit: https://console.aws.amazon.com/cloudfront"
    
    cd ..
}

# Deploy based on choice
case $DEPLOY_CHOICE in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📖 Next steps:"
echo "1. Update backend CORS with CloudFront domain"
echo "2. Update frontend API URL with EB backend URL"
echo "3. Test your application"
echo ""
echo "For more help, see: AWS_DEPLOYMENT.md"
