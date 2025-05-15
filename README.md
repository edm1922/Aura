# Aura Personality Test

An AI-powered personality test application built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aura_personality_test"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

3. Set up the database:
```bash
# Create and apply database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

This project uses PostgreSQL as the database. Before running the application:

1. Install PostgreSQL if you haven't already
2. Create a new database named `aura_personality_test`
3. Update the `DATABASE_URL` in your `.env` file with your database credentials
4. Run the database migrations using `npx prisma migrate dev`

## Project Structure

- `/src/app` - Next.js app directory (pages and layouts)
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared logic
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma Client

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- PostgreSQL (Database)
- NextAuth.js (Authentication)
- Jest (Testing)

## Development Notes

- Always run database migrations in development using `npx prisma migrate dev`
- Use Prisma Studio (`npx prisma studio`) to view and edit database records
- Keep your `.env` file secure and never commit it to version control
- Update the `NEXTAUTH_SECRET` in production with a secure random string

## Deployment on Vercel

This project is optimized for deployment on Vercel. Follow these steps to deploy:

1. **Push your code to GitHub**
   - Make sure your code is in a GitHub repository

2. **Create a new project on Vercel**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: npm run build
     - Output Directory: .next

3. **Set up environment variables**
   - In the Vercel project settings, add the following environment variables:
     - `DATABASE_URL`: Your production database URL
     - `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
     - `NEXTAUTH_SECRET`: A secure random string
     - `DEEPSEEK_API_KEY`: Your DeepSeek API key

4. **Set up a PostgreSQL database**
   - You can use services like [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) for hosting your PostgreSQL database
   - Update the `DATABASE_URL` environment variable with your production database connection string

5. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Your application will be available at the provided Vercel URL

6. **Post-deployment**
   - After the first deployment, you may need to manually run database migrations
   - You can do this by connecting to your database and running the SQL migrations or using the Prisma CLI

### Continuous Deployment

Vercel automatically deploys your application when you push changes to your GitHub repository. The optimized build script will:

- Generate the Prisma client
- Run database migrations (in production only)
- Build the Next.js application
- Apply optimizations for performance

### Monitoring

After deployment, monitor your application using:

- Vercel Analytics (available in your Vercel dashboard)
- Database monitoring tools provided by your database host
- The built-in error tracking in the admin section of your application