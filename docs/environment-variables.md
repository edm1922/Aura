# Environment Variables Documentation

This document explains all environment variables used in the Aura Personality Test application.

## Required Environment Variables

These variables are required for the application to function properly:

### Database Configuration

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:password@host:port/database` |

### Authentication (NextAuth.js)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXTAUTH_URL` | Full URL of your application | Yes | `http://localhost:3000` (dev) or `https://your-app.vercel.app` (prod) |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (min 32 chars) | Yes | `your-secret-key-at-least-32-characters-long` |

### AI Integration

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | Yes | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## Optional Environment Variables

These variables are optional and provide additional functionality:

### Analytics (if implemented)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ANALYTICS_API_KEY` | API key for analytics service | No | `your-analytics-api-key` |

### Error Tracking (if implemented)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ERROR_TRACKING_DSN` | DSN for error tracking service | No | `your-error-tracking-dsn` |

## Environment-Specific Variables

### Development Environment (.env.local)

For local development, create a `.env.local` file with:

```
DATABASE_URL="postgresql://username:password@localhost:5432/aura_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key-at-least-32-characters"
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

### Production Environment (.env.production)

For production deployment on Vercel, the following variables should be set in the Vercel dashboard:

```
DATABASE_URL=${DATABASE_URL}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
NODE_ENV=production
```

## Security Considerations

- Never commit actual secret values to your repository
- Use different secret values for development and production
- Rotate secrets periodically for better security
- Ensure your database connection uses SSL in production

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Verify your `DATABASE_URL` is correctly formatted
2. Ensure the database server is running and accessible
3. Check that the database user has appropriate permissions
4. For Vercel deployment, ensure your database allows connections from Vercel's IP ranges

### NextAuth Configuration Issues

If authentication is not working:

1. Verify `NEXTAUTH_URL` matches your actual application URL
2. Ensure `NEXTAUTH_SECRET` is at least 32 characters long
3. Check that your database tables for authentication are properly created

### DeepSeek API Issues

If AI features are not working:

1. Verify your `DEEPSEEK_API_KEY` is valid
2. Check the DeepSeek API status
3. Ensure your account has sufficient quota
