# CivicMind Health AI - Deployment Guide

## 🔒 Security Verification Checklist

Before deploying, verify:

- ✅ `.env` file is in `.gitignore`
- ✅ `.env` file is NOT in GitHub repository
- ✅ `.env.example` is in GitHub (safe template)
- ✅ AWS credentials are stored securely

### Verify .env is Protected

```bash
# Check if .env is ignored
git check-ignore backend-lambda/.env

# Should output: backend-lambda/.env (means it's ignored)

# Check if .env is tracked in git
git ls-files | Select-String "\.env"

# Should output: nothing (means .env is not tracked)
```

---

## 🚀 Deployment Options

### Option 1: AWS Full Stack (Recommended for Production)

**Architecture:**
- Frontend: S3 + CloudFront
- Backend: Lambda + API Gateway
- AI: AWS Bedrock (already configured)
- Voice: AWS Polly (already configured)

#### Step 1: Deploy Backend to AWS Lambda

1. **Install AWS CLI and SAM CLI:**
```bash
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Install SAM CLI
# Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

2. **Create SAM template** (already prepared below)

3. **Deploy:**
```bash
cd backend-lambda
sam build
sam deploy --guided
```

4. **Set Environment Variables in Lambda:**
- Go to AWS Lambda Console
- Select your function
- Configuration → Environment variables
- Add: `AWS_REGION`, `BEDROCK_MODEL_ID`, `CORS_ORIGIN`

#### Step 2: Deploy Frontend to S3 + CloudFront

1. **Build Frontend:**
```bash
npm run build
```

2. **Create S3 Bucket:**
```bash
aws s3 mb s3://civicmind-health-ai-frontend
```

3. **Upload Build:**
```bash
aws s3 sync dist/ s3://civicmind-health-ai-frontend --delete
```

4. **Configure S3 for Static Hosting:**
```bash
aws s3 website s3://civicmind-health-ai-frontend --index-document index.html --error-document index.html
```

5. **Create CloudFront Distribution:**
- Go to CloudFront Console
- Create distribution
- Origin: Your S3 bucket
- Enable HTTPS
- Set default root object: `index.html`

6. **Update Frontend API URL:**
- Update `src/config/constants.js` with your Lambda API Gateway URL

---

### Option 2: Vercel (Quick Demo Deployment)

**Best for:** Quick demos, testing, prototypes

#### Deploy Frontend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set Environment Variables:**
- Go to Vercel Dashboard
- Project Settings → Environment Variables
- Add: `VITE_API_URL` (your backend URL)

#### Backend Options for Vercel:
- Keep backend on AWS Lambda (recommended)
- Or deploy backend to Vercel Serverless Functions (requires adaptation)

---

### Option 3: Netlify (Frontend) + AWS Lambda (Backend)

**Best for:** Easy frontend deployment with AWS backend

#### Deploy Frontend to Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

4. **Configure:**
- Add `_redirects` file in `public/`:
```
/*    /index.html   200
```

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] `.env` file is NOT in GitHub
- [ ] `.env.example` is in GitHub
- [ ] AWS credentials are stored in AWS Secrets Manager (for production)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled

### Configuration
- [ ] Update API URLs in frontend config
- [ ] Set correct CORS_ORIGIN in backend
- [ ] Configure AWS Bedrock model access
- [ ] Enable AWS Polly in your region

### Testing
- [ ] Test locally first (frontend + backend)
- [ ] Test API endpoints
- [ ] Test AI features (health summary, chat, translation)
- [ ] Test voice features (text-to-speech)
- [ ] Test on mobile devices

---

## 🧪 Local Testing Before Deployment

### 1. Test Backend

```bash
cd backend-lambda
node server.js
```

Visit: http://localhost:3001/api/health

### 2. Test Frontend

```bash
npm run dev
```

Visit: http://localhost:5173

### 3. Test Full Flow

1. Login with ABHA ID: `1234-5678-9012-3456`
2. Test patient dashboard
3. Test doctor dashboard
4. Test AI features
5. Test voice features

---

## 🔍 Verify Deployment

### Check Frontend
```bash
curl https://your-frontend-url.com
```

### Check Backend
```bash
curl https://your-backend-url.com/api/health
```

### Check AI Integration
```bash
curl -X POST https://your-backend-url.com/api/patient-health-summary \
  -H "Content-Type: application/json" \
  -d '{"patientData": {...}}'
```

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution:** Update `CORS_ORIGIN` in backend `.env` to match your frontend URL

### Issue: AWS Bedrock Access Denied
**Solution:** 
1. Go to AWS Bedrock Console
2. Request model access for Gemma 3 27B
3. Wait for approval (usually instant)

### Issue: AWS Polly Not Working
**Solution:** Verify AWS Polly is available in your region (us-east-1 recommended)

### Issue: Environment Variables Not Loading
**Solution:** 
- For Lambda: Set in AWS Console → Lambda → Configuration → Environment variables
- For Vercel: Set in Vercel Dashboard → Project Settings → Environment Variables
- For Netlify: Set in Netlify Dashboard → Site Settings → Environment Variables

---

## 📊 Monitoring & Logs

### AWS CloudWatch (for Lambda)
```bash
aws logs tail /aws/lambda/your-function-name --follow
```

### Vercel Logs
```bash
vercel logs
```

### Netlify Logs
- Check Netlify Dashboard → Deploys → Function logs

---

## 💰 Cost Estimation

### AWS (Monthly)
- **S3 + CloudFront:** $5-10 (for moderate traffic)
- **Lambda:** $0-5 (first 1M requests free)
- **API Gateway:** $3.50 per million requests
- **Bedrock (Gemma 3 27B):** ~$0.0002 per 1K tokens
- **Polly:** $4 per 1M characters

**Total:** ~$15-30/month for moderate usage

### Vercel
- **Free Tier:** Hobby plan (good for demos)
- **Pro:** $20/month (for production)

### Netlify
- **Free Tier:** 100GB bandwidth
- **Pro:** $19/month

---

## 🎯 Recommended Deployment Strategy

**For Demo/Prototype:**
1. Frontend: Vercel or Netlify (free tier)
2. Backend: AWS Lambda (free tier)

**For Production:**
1. Frontend: AWS S3 + CloudFront
2. Backend: AWS Lambda + API Gateway
3. Database: AWS DynamoDB (when needed)
4. Monitoring: AWS CloudWatch

---

## 📝 Post-Deployment Tasks

1. **Update README.md** with live URLs
2. **Test all features** on production
3. **Set up monitoring** (CloudWatch, Sentry)
4. **Configure custom domain** (optional)
5. **Enable HTTPS** (CloudFront, Vercel, Netlify handle this)
6. **Set up CI/CD** (GitHub Actions)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use AWS Secrets Manager** for production credentials
3. **Enable AWS WAF** for DDoS protection
4. **Use CloudFront** for CDN and security
5. **Enable rate limiting** (already configured)
6. **Regular security audits**
7. **Keep dependencies updated**

---

## 📞 Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Check browser console for frontend errors
3. Test API endpoints individually
4. Verify environment variables are set correctly

---

**Built with ❤️ by Team CivicMind**
