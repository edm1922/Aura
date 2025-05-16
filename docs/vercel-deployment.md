# Vercel Deployment Guide for Aura Personality Test

This document provides instructions for deploying the Aura Personality Test application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/signup) (for repository hosting)
3. Access to the [DeepSeek API](https://platform.deepseek.com/) (for AI features)
4. A PostgreSQL database (can use Vercel Postgres or an external provider)

## Environment Variables

The following environment variables must be set in the Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:port/database` |
| `NEXTAUTH_URL` | Full URL of your deployed application | `https://your-app-name.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (min 32 chars) | `your-secret-key-at-least-32-characters-long` |
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Push your code to GitHub at https://github.com/edm1922/Aura
2. Log in to your Vercel account
3. Click "Add New" > "Project"
4. Select your GitHub repository
5. Vercel will automatically detect that this is a Next.js project

### 2. Configure Project Settings

1. **Framework Preset**: Ensure "Next.js" is selected
2. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install --legacy-peer-deps`

3. **Environment Variables**:
   - Add all required environment variables listed above
   - Make sure to use production-ready values

### 3. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Once complete, you'll receive a deployment URL

## Troubleshooting

### Build Failures

If you encounter build failures:

1. Check the build logs in the Vercel dashboard
2. Ensure all environment variables are correctly set
3. Verify that the database is accessible from Vercel

### Database Connection Issues

If you experience database connection problems:

1. Ensure your database allows connections from Vercel's IP ranges
2. Check that your DATABASE_URL is correctly formatted
3. Verify that the database user has appropriate permissions

### API Timeouts

If DeepSeek API calls are timing out:

1. Check the DeepSeek API status
2. Consider implementing retry logic in your API routes
3. Ensure your API key is valid and has sufficient quota

## Monitoring and Maintenance

### Performance Monitoring

The application includes built-in performance monitoring. To view metrics:

1. Navigate to your Vercel dashboard
2. Select your project
3. Go to the "Analytics" tab

### Error Tracking

Errors are logged in the database. To view them:

1. Access your database
2. Query the `ErrorLog` table

## Local Development After Deployment

For local development after deployment:

1. Keep using your `.env.local` file for local environment variables
2. The `.env.production` file is used by Vercel during deployment
3. Run `npm run dev` to start the development server locally

## CI/CD Pipeline

Vercel automatically sets up a CI/CD pipeline:

1. Every push to the main branch triggers a production deployment
2. Pull requests create preview deployments
3. You can configure additional branch deployments in the Vercel dashboard

## Custom Domains

To use a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain and follow the verification steps
