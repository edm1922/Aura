# CI/CD Pipeline Setup for Aura

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) setup for the Aura application using GitHub Actions and Vercel.

## Overview

The CI/CD pipeline consists of:

1. **Continuous Integration (CI)**: Runs on every push to main/develop branches and on pull requests
   - Linting
   - Testing
   - Preview deployments for pull requests

2. **Continuous Deployment (CD)**: Runs on pushes to main/develop branches
   - Production deployment (from main branch)
   - Staging deployment (from develop branch)

## Prerequisites

Before the CI/CD pipeline can work, you need to set up the following:

### 1. Vercel Account and Project

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Create a new project and link it to your GitHub repository
3. Configure your project settings in Vercel

### 2. GitHub Repository Secrets

Add the following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `DATABASE_URL`: Your PostgreSQL database connection string
- `NEXTAUTH_URL`: The URL of your application
- `NEXTAUTH_SECRET`: A secret key for NextAuth
- `DEEPSEEK_API_KEY`: Your DeepSeek API key

#### How to Get Vercel Credentials

1. **VERCEL_TOKEN**:
   - Go to your Vercel account settings
   - Navigate to "Tokens"
   - Create a new token with "Full Access" scope

2. **VERCEL_ORG_ID and VERCEL_PROJECT_ID**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel link` in your project directory
   - Check the `.vercel/project.json` file for both IDs

### 3. GitHub Environments

Create two environments in your GitHub repository settings:

1. **production**: For production deployments
   - Add environment-specific secrets if needed
   - Configure required reviewers if needed

2. **staging**: For staging deployments
   - Add environment-specific secrets if needed

## Workflow Files

The CI/CD pipeline is defined in two workflow files:

1. `.github/workflows/ci.yml`: Handles continuous integration
2. `.github/workflows/cd.yml`: Handles continuous deployment

## CI Workflow

The CI workflow runs on every push to main/develop branches and on pull requests. It performs:

- **Linting**: Checks code quality using ESLint
- **Testing**: Runs unit tests with Jest
- **Preview Deployment**: Creates a preview deployment on Vercel for pull requests

## CD Workflow

The CD workflow runs on pushes to main/develop branches. It performs:

- **Production Deployment**: Deploys to Vercel production environment from the main branch
- **Staging Deployment**: Deploys to Vercel staging environment from the develop branch

## Vercel Configuration

The Vercel configuration is defined in `vercel.json`. This file specifies:

- Build, development, and installation commands
- Environment variables
- Deployment regions

## Branching Strategy

For optimal use of this CI/CD pipeline, follow this branching strategy:

1. **main**: Production-ready code
   - Deploys to production environment
   - Should always be stable

2. **develop**: Integration branch
   - Deploys to staging environment
   - Used for testing before production

3. **feature/\***: Feature branches
   - Create pull requests to develop
   - Get preview deployments for testing

## Manual Deployment

You can also trigger deployments manually:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "CD" workflow
3. Click "Run workflow"
4. Select the branch to deploy
5. Click "Run workflow"

## Troubleshooting

If you encounter issues with the CI/CD pipeline:

1. Check GitHub Actions logs for error messages
2. Verify that all required secrets are set correctly
3. Ensure Vercel project is properly configured
4. Check that your database is accessible from GitHub Actions and Vercel

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Action](https://github.com/marketplace/actions/vercel-action)
