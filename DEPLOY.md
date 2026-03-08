# Deploy CivicMind to AWS - Simple Steps

## Prerequisites (One-time setup)

1. Install AWS CLI: https://aws.amazon.com/cli/
2. Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
3. Configure AWS:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Region: us-east-1
   ```

4. Enable Bedrock Model:
   - Go to: https://console.aws.amazon.com/bedrock
   - Click "Model access" → Enable "Google Gemma 3 27B IT"

---

## Deploy Backend

```powershell
# 1. Create DynamoDB table
aws dynamodb create-table `
    --table-name CivicMindChatHistory `
    --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=patientId,AttributeType=S AttributeName=updatedAt,AttributeType=S `
    --key-schema AttributeName=sessionId,KeyType=HASH `
    --global-secondary-indexes "[{\"IndexName\":\"PatientIdIndex\",\"KeySchema\":[{\"AttributeName\":\"patientId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"updatedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" `
    --billing-mode PAY_PER_REQUEST `
    --region us-east-1

# 2. Deploy Lambda
cd backend-lambda
npm install --production
sam build
sam deploy --guided
# Stack name: civicmind-backend
# Region: us-east-1
# Confirm all prompts

# 3. Get API URL
aws cloudformation describe-stacks --stack-name civicmind-backend --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text

# Save this URL!
```

---

## Deploy Frontend

```powershell
# 1. Create .env.production with your API URL
echo "VITE_API_URL=YOUR_API_URL_HERE" > .env.production

# 2. Build
npm install
npm run build

# 3. Create S3 bucket
$BUCKET="civicmind-frontend-$(Get-Date -Format 'yyyyMMddHHmmss')"
aws s3 mb s3://$BUCKET --region us-east-1

# 4. Enable website hosting
aws s3 website s3://$BUCKET --index-document index.html --error-document index.html

# 5. Set public access
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET/*"
  }]
}
"@
$policy | Out-File -FilePath bucket-policy.json
aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json

# 6. Upload files
aws s3 sync dist/ s3://$BUCKET/ --delete

# 7. Get URL
echo "http://$BUCKET.s3-website-us-east-1.amazonaws.com"
```

---

## Test

```powershell
# Test backend
curl YOUR_API_URL/api/health

# Test frontend
# Open: http://YOUR_BUCKET.s3-website-us-east-1.amazonaws.com
# Login: 14-1234-5678-9012
```

---

## Cleanup (After hackathon)

```powershell
aws cloudformation delete-stack --stack-name civicmind-backend
aws s3 rb s3://$BUCKET --force
aws dynamodb delete-table --table-name CivicMindChatHistory
```

---

**Cost: ~$25/week for demo**
