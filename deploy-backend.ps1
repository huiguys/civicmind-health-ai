# CivicMind Backend Deployment Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "CivicMind Backend Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$REGION = "us-east-1"
$STACK_NAME = "civicmind-backend"

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  Stack Name: $STACK_NAME"
Write-Host "  Region: $REGION"
Write-Host ""

# Check if AWS CLI is configured
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "AWS CLI configured" -ForegroundColor Green
} catch {
    Write-Host "Error: AWS CLI is not configured" -ForegroundColor Red
    Write-Host "Run: aws configure"
    exit 1
}

Write-Host ""

# Check if DynamoDB table exists
Write-Host "Checking DynamoDB table..." -ForegroundColor Yellow
try {
    aws dynamodb describe-table --table-name CivicMindChatHistory --region $REGION | Out-Null
    Write-Host "DynamoDB table exists" -ForegroundColor Green
} catch {
    Write-Host "Creating DynamoDB table..." -ForegroundColor Yellow
    
    aws dynamodb create-table `
        --table-name CivicMindChatHistory `
        --attribute-definitions `
            AttributeName=sessionId,AttributeType=S `
            AttributeName=patientId,AttributeType=S `
            AttributeName=updatedAt,AttributeType=S `
        --key-schema `
            AttributeName=sessionId,KeyType=HASH `
        --global-secondary-indexes `
            "[{`"IndexName`":`"PatientIdIndex`",`"KeySchema`":[{`"AttributeName`":`"patientId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"updatedAt`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
        --billing-mode PAY_PER_REQUEST `
        --region $REGION
    
    Write-Host "Waiting for table to be active..." -ForegroundColor Yellow
    aws dynamodb wait table-exists --table-name CivicMindChatHistory --region $REGION
    Write-Host "DynamoDB table created" -ForegroundColor Green
}

Write-Host ""

# Navigate to backend directory
Set-Location backend-lambda

# Install dependencies
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
npm install --production

# Build SAM application
Write-Host "Building SAM application..." -ForegroundColor Yellow
sam build

# Deploy
Write-Host "Deploying to AWS..." -ForegroundColor Yellow
if (Test-Path "samconfig.toml") {
    Write-Host "Using existing SAM configuration..." -ForegroundColor Cyan
    sam deploy
} else {
    Write-Host "Running guided deployment..." -ForegroundColor Cyan
    sam deploy --guided
}

# Get API URL
Write-Host "`nRetrieving API Gateway URL..." -ForegroundColor Yellow
$API_URL = aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --query 'Stacks[0].Outputs[?OutputKey==``ApiUrl``].OutputValue' `
    --output text `
    --region $REGION

# Get Function Name
$FUNCTION_NAME = aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --query 'Stacks[0].Outputs[?OutputKey==``FunctionName``].OutputValue' `
    --output text `
    --region $REGION

Write-Host "`nBackend Deployment Complete!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "API Gateway URL: $API_URL" -ForegroundColor Cyan
Write-Host "Lambda Function: $FUNCTION_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the API:" -ForegroundColor Yellow
Write-Host "  curl $API_URL/api/health"
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  aws logs tail /aws/lambda/$FUNCTION_NAME --follow"
Write-Host ""
Write-Host "Next Step:" -ForegroundColor Yellow
Write-Host "  Deploy frontend with this API URL:"
Write-Host "  .\deploy-frontend.ps1 $API_URL"
Write-Host ""

# Save API URL for frontend deployment
Set-Location ..
$API_URL | Out-File -FilePath "api-url.txt" -Encoding UTF8
Write-Host "API URL saved to: api-url.txt" -ForegroundColor Green
