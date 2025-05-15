import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string | null
  }

  interface Session {
    user: User & {
      id: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.sub!
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      // If the user just signed in or there was a session update, fetch from DB
      if (user || trigger === 'update') {
        // If we have the user object from the authorize callback, use it
        if (user) {
          return {
            ...token,
            id: user.id,
            name: user.name,
            email: user.email,
          }
        }

        // Otherwise, look it up in the database (only when necessary)
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email as string,
          },
        })

        if (!dbUser) {
          return token
        }

        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
        }
      }

      // For all other cases, just return the token without hitting the database
      return token
    }
  },
}