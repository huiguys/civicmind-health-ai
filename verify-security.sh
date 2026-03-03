#!/bin/bash

# CivicMind Health AI - Security Verification Script

echo "🔒 CivicMind Health AI - Security Verification"
echo "=============================================="
echo ""

# Check 1: .env in .gitignore
echo "✓ Checking if .env is in .gitignore..."
if grep -q "backend-lambda/.env" .gitignore; then
    echo "  ✅ PASS: .env is in .gitignore"
else
    echo "  ❌ FAIL: .env is NOT in .gitignore"
    exit 1
fi

# Check 2: .env not tracked by git
echo ""
echo "✓ Checking if .env is tracked by git..."
if git ls-files --error-unmatch backend-lambda/.env 2>/dev/null; then
    echo "  ❌ FAIL: .env is tracked by git!"
    echo "  Run: git rm --cached backend-lambda/.env"
    exit 1
else
    echo "  ✅ PASS: .env is NOT tracked by git"
fi

# Check 3: .env exists locally
echo ""
echo "✓ Checking if .env exists locally..."
if [ -f "backend-lambda/.env" ]; then
    echo "  ✅ PASS: .env file exists"
else
    echo "  ⚠️  WARNING: .env file not found"
    echo "  Create it from backend-lambda/.env.example"
fi

# Check 4: .env.example exists
echo ""
echo "✓ Checking if .env.example exists..."
if [ -f "backend-lambda/.env.example" ]; then
    echo "  ✅ PASS: .env.example exists"
else
    echo "  ❌ FAIL: .env.example not found"
    exit 1
fi

# Check 5: .env not in git history
echo ""
echo "✓ Checking git history for .env..."
if git log --all --full-history -- "backend-lambda/.env" | grep -q "commit"; then
    echo "  ⚠️  WARNING: .env found in git history!"
    echo "  You may need to remove it from history"
else
    echo "  ✅ PASS: .env not in git history"
fi

# Check 6: No AWS credentials in tracked files
echo ""
echo "✓ Checking for exposed AWS credentials..."
if git grep -i "AKIA" 2>/dev/null | grep -v ".env.example"; then
    echo "  ❌ FAIL: AWS credentials found in tracked files!"
    exit 1
else
    echo "  ✅ PASS: No AWS credentials in tracked files"
fi

echo ""
echo "=============================================="
echo "✅ All security checks passed!"
echo ""
echo "Safe to deploy! 🚀"
