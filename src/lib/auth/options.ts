import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

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
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) {
          throw new Error('No account found with this email')
        }

        if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
          throw new Error('Your account has been suspended')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'CUSTOMER'
      }

      // Update session trigger
      if (trigger === 'update' && session) {
        token.name = session.name
        token.image = session.picture
      }

      // Fetch fresh data from DB
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, loyaltyPoints: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.loyaltyPoints = dbUser.loyaltyPoints
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).loyaltyPoints = token.loyaltyPoints
      }
      return session
    },

    async signIn({ user, account }) {
      // Block banned users
      if (account?.provider === 'credentials') return true

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (existingUser?.status === 'BANNED' || existingUser?.status === 'SUSPENDED') {
        return false
      }

      return true
    },
  },

  events: {
    async createUser({ user }) {
      // Award signup loyalty points
      if (user.id) {
        await prisma.loyaltyTransaction.create({
          data: {
            userId: user.id,
            points: 50,
            type: 'EARN_SIGNUP',
            description: 'Welcome bonus – 50 points for joining!',
          },
        })
        await prisma.user.update({
          where: { id: user.id },
          data: { loyaltyPoints: { increment: 50 } },
        })
      }
    },
  },
}
