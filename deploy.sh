#!/bin/bash

# CivicMind Health AI - Quick Deployment Script

echo "🚀 CivicMind Health AI Deployment"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f "backend-lambda/.env" ]; then
    echo "❌ Error: backend-lambda/.env file not found!"
    echo "Please create it from backend-lambda/.env.example"
    exit 1
fi

# Verify .env is not tracked
if git ls-files --error-unmatch backend-lambda/.env 2>/dev/null; then
    echo "⚠️  WARNING: .env file is tracked by git!"
    echo "Run: git rm --cached backend-lambda/.env"
    exit 1
fi

echo "✅ Security check passed - .env is not in git"
echo ""

# Ask deployment target
echo "Select deployment target:"
echo "1) AWS (S3 + Lambda)"
echo "2) Vercel"
echo "3) Netlify"
echo "4) Local test only"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📦 Building frontend..."
        npm run build
        
        echo ""
        echo "🚀 Deploying to AWS..."
        echo "Please run these commands manually:"
        echo ""
        echo "# Deploy Backend:"
        echo "cd backend-lambda"
        echo "sam build"
        echo "sam deploy --guided"
        echo ""
        echo "# Deploy Frontend:"
        echo "aws s3 sync dist/ s3://your-bucket-name --delete"
        ;;
    2)
        echo ""
        echo "📦 Building frontend..."
        npm run build
        
        echo ""
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "📦 Building frontend..."
        npm run build
        
        echo ""
        echo "🚀 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        ;;
    4)
        echo ""
        echo "🧪 Starting local test servers..."
        echo ""
        echo "Terminal 1 - Backend:"
        echo "cd backend-lambda && node server.js"
        echo ""
        echo "Terminal 2 - Frontend:"
        echo "npm run dev"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process initiated!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
