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