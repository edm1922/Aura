# Aura Deployment Guide

This document provides instructions for deploying the Aura application to Vercel.

## Prerequisites

- A Vercel account
- A GitHub repository with the Aura codebase
- Required environment variables

## Environment Variables

The following environment variables need to be set in the Vercel dashboard:

1. `DATABASE_URL` - Your PostgreSQL database connection string
2. `NEXTAUTH_SECRET` - A secure random string for NextAuth.js
3. `DEEPSEEK_API_KEY` - Your DeepSeek API key

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
   - Go to the Vercel dashboard
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Click "Import"

2. **Configure the project**
   - Set the framework preset to "Next.js"
   - Set the build command to `npm run build`
   - Set the output directory to `.next`
   - Set the install command to `npm install --legacy-peer-deps`

3. **Set environment variables**
   - Add the required environment variables in the Vercel dashboard
   - Make sure to set `NEXTAUTH_URL` to your production URL (e.g., `https://your-app.vercel.app`)

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Build errors**
   - Check the build logs in the Vercel dashboard
   - Make sure all required environment variables are set
   - Ensure the build script is working correctly

2. **Runtime errors**
   - Check the function logs in the Vercel dashboard
   - Verify that your database is accessible from Vercel
   - Check that your API keys are valid

3. **Database issues**
   - Ensure your database is properly configured and accessible
   - Check that the Prisma schema matches your database schema
   - Verify that the database connection string is correct

## Local Testing

To test the build process locally before deploying:

```bash
# Test the build bypass script
node scripts/test-vercel-build.js

# Test a full build
npm run build:next
```

## Custom Build Process

This project uses a custom build process for Vercel deployment. The `scripts/vercel-build-bypass.js` script creates a minimal build structure that Vercel can deploy without running into static generation errors.

If you need to modify the build process, edit the `scripts/vercel-build-bypass.js` file.
