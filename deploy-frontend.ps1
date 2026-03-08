# CivicMind Frontend Deployment Script (PowerShell)
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl
)

$ErrorActionPreference = "Stop"

Write-Host "CivicMind Frontend Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$BUCKET_NAME = "civicmind-frontend-$(Get-Date -Format 'yyyyMMddHHmmss')"
$REGION = "us-east-1"

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  API URL: $ApiUrl"
Write-Host "  Bucket: $BUCKET_NAME"
Write-Host "  Region: $REGION"
Write-Host ""

# Create .env.production file
Write-Host "Creating production environment file..." -ForegroundColor Yellow
@"
VITE_API_URL=$ApiUrl
"@ | Out-File -FilePath ".env.production" -Encoding UTF8

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

# Create S3 bucket
Write-Host "Creating S3 bucket..." -ForegroundColor Yellow
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
Write-Host "Enabling static website hosting..." -ForegroundColor Yellow
aws s3 website s3://$BUCKET_NAME `
    --index-document index.html `
    --error-document index.html

# Create bucket policy
Write-Host "Setting bucket policy..." -ForegroundColor Yellow
$policyJson = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
"@

$policyJson | Out-File -FilePath "$env:TEMP\bucket-policy.json" -Encoding UTF8

aws s3api put-bucket-policy `
    --bucket $BUCKET_NAME `
    --policy file:///$env:TEMP/bucket-policy.json

# Upload files
Write-Host "Uploading files to S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://$BUCKET_NAME/ `
    --delete `
    --cache-control "public, max-age=31536000" `
    --exclude "index.html" `
    --exclude "*.map"

# Upload index.html separately with no-cache
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html `
    --cache-control "no-cache, no-store, must-revalidate"

# Get website URL
$WEBSITE_URL = "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Frontend URL: $WEBSITE_URL" -ForegroundColor Cyan
Write-Host "Backend API: $ApiUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Patient ABHA ID: 14-1234-5678-9012"
Write-Host "  Doctor Login: demo@civicmind.health"
Write-Host ""
Write-Host "Share this URL with judges:" -ForegroundColor Yellow
Write-Host "  $WEBSITE_URL"
Write-Host ""

# Save deployment info
$deploymentInfo = @"
CivicMind Health AI - Deployment Information
============================================

Deployment Date: $(Get-Date)
Frontend URL: $WEBSITE_URL
Backend API: $ApiUrl
S3 Bucket: $BUCKET_NAME
Region: $REGION

Test Credentials:
- Patient ABHA ID: 14-1234-5678-9012
- Doctor Login: demo@civicmind.health

Monitoring:
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=$REGION
- S3 Bucket: https://s3.console.aws.amazon.com/s3/buckets/$BUCKET_NAME
- API Gateway: https://console.aws.amazon.com/apigateway/home?region=$REGION

Cost Estimate: ~$25/week for demo usage
"@

$deploymentInfo | Out-File -FilePath "deployment-info.txt" -Encoding UTF8
Write-Host "Deployment info saved to: deployment-info.txt" -ForegroundColor Green
