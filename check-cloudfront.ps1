#!/usr/bin/env pwsh
# Check CloudFront deployment status

Write-Host "Checking CloudFront deployment status..." -ForegroundColor Cyan

$status = aws cloudfront get-distribution --id ETBM9YOID9E4T --query 'Distribution.Status' --output text

Write-Host "Status: $status" -ForegroundColor Yellow

if ($status -eq "Deployed") {
    Write-Host "`nCloudFront is READY!" -ForegroundColor Green
    Write-Host "`nYour universal URL (works on ALL devices):" -ForegroundColor Cyan
    Write-Host "https://d23719i3vbddmf.cloudfront.net" -ForegroundColor White
    Write-Host "`nTest it now on your mobile phone!" -ForegroundColor Green
} else {
    Write-Host "`nStill deploying... Please wait a few more minutes." -ForegroundColor Yellow
    Write-Host "Run this script again to check status." -ForegroundColor Yellow
}
