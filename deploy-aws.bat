@echo off
REM Trust Coin AWS Deployment Script for Windows
REM This script automates the deployment process to AWS

setlocal enabledelayedexpansion

echo.
echo 🚀 Trust Coin AWS Deployment Script
echo ====================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS CLI not found. Install it first:
    echo    https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Check if EB CLI is installed
eb --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Elastic Beanstalk CLI not found. Install it first:
    echo    pip install awsebcli
    pause
    exit /b 1
)

echo ✅ All prerequisites found
echo.

REM Ask for deployment type
echo 🔧 Deployment Options:
echo 1^) Deploy Backend Only (Elastic Beanstalk)
echo 2^) Deploy Frontend Only (S3 + CloudFront)
echo 3^) Deploy Both (Backend + Frontend)
echo.
set /p DEPLOY_CHOICE="Enter choice (1-3): "

if "%DEPLOY_CHOICE%"=="1" (
    call :deploy_backend
) else if "%DEPLOY_CHOICE%"=="2" (
    call :deploy_frontend
) else if "%DEPLOY_CHOICE%"=="3" (
    call :deploy_backend
    call :deploy_frontend
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment complete!
echo.
echo 📖 Next steps:
echo 1. Update backend CORS with CloudFront domain
echo 2. Update frontend API URL with EB backend URL
echo 3. Test your application
echo.
echo For more help, see: AWS_DEPLOYMENT.md
pause
exit /b 0

:deploy_backend
echo.
echo 📦 Deploying Backend to Elastic Beanstalk...

cd backend

if not exist ".elasticbeanstalk" (
    echo ⚙️ Initializing Elastic Beanstalk...
    set /p APP_NAME="Enter application name (default: trust-coin-api): "
    if "!APP_NAME!"=="" set APP_NAME=trust-coin-api
    set /p REGION="Enter AWS region (default: us-east-1): "
    if "!REGION!"=="" set REGION=us-east-1
    
    call eb init -p node.js-22 !APP_NAME! --region !REGION!
)

echo 🚀 Deploying to Elastic Beanstalk...
call eb deploy

echo.
echo ✅ Backend deployed successfully!
echo.
echo 📝 Save your EB URL for frontend configuration
cd ..
exit /b 0

:deploy_frontend
echo.
echo 🎨 Deploying Frontend to S3 + CloudFront...

set /p BUCKET_NAME="Enter S3 bucket name (e.g., trust-coin-frontend-prod): "
set /p DISTRIBUTION_ID="Enter CloudFront Distribution ID (if updating existing): "

cd frontend

echo 🏗️ Building frontend...
call npm run build

echo 📤 Checking if S3 bucket exists...
aws s3 ls "s3://!BUCKET_NAME!" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📁 Creating S3 bucket: !BUCKET_NAME!
    call aws s3 mb "s3://!BUCKET_NAME!" --region us-east-1
    
    echo 🌐 Enabling website hosting...
    call aws s3 website "s3://!BUCKET_NAME!" ^
        --index-document index.html ^
        --error-document index.html
)

echo ⬆️ Uploading files to S3...
call aws s3 sync dist/ "s3://!BUCKET_NAME!" --delete

if not "!DISTRIBUTION_ID!"=="" (
    echo 🔄 Invalidating CloudFront cache...
    call aws cloudfront create-invalidation ^
        --distribution-id "!DISTRIBUTION_ID!" ^
        --paths "/*"
)

echo.
echo ✅ Frontend deployed successfully!
echo S3 Bucket: !BUCKET_NAME!
echo To set up CloudFront, visit: https://console.aws.amazon.com/cloudfront

cd ..
exit /b 0
