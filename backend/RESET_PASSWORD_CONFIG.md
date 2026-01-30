# Reset Password Email Configuration

## Overview
The system now automatically selects the correct reset password URL based on the deployment environment.

## How it works

### 1. Development Environment (localhost)
```env
NODE_ENV=development
```
- Automatically uses: `http://localhost:5173/reset-password/`
- Perfect for local development and testing

### 2. Vercel Production
```env
NODE_ENV=production
# Keep CUSTOM_DOMAIN commented out
```
- Automatically uses: `https://iteg-management-system-nth9.vercel.app/reset-password/`
- Used when deployed on Vercel

### 3. AWS Production (Custom Domain)
```env
NODE_ENV=production
CUSTOM_DOMAIN=https://iteg.ssism.org
```
- Automatically uses: `https://iteg.ssism.org/reset-password/`
- Used when deployed on AWS with custom domain

## Configuration Steps

### For Local Development:
1. Set `NODE_ENV=development` in `.env`
2. Keep `CUSTOM_DOMAIN` commented out
3. Reset emails will use localhost URL

### For Vercel Deployment:
1. Set `NODE_ENV=production` in Vercel environment variables
2. Don't set `CUSTOM_DOMAIN` variable
3. Reset emails will use Vercel URL

### For AWS Deployment:
1. Set `NODE_ENV=production` in AWS environment
2. Set `CUSTOM_DOMAIN=https://iteg.ssism.org` in AWS environment
3. Reset emails will use custom domain URL

## Testing
Run the test script to verify URL selection:
```bash
node test-url-selection.js
```

## Debug Logs
The system logs which URL is being used:
- 🏠 Development: localhost URL
- ☁️ Production: Vercel URL  
- 🌐 Custom: AWS domain URL

Check server logs to see which URL is being selected for reset emails.