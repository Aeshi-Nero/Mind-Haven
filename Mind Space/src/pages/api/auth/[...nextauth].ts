import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import pool from '@/lib/db';

// Use a consistent secret for JWT encryption/decryption
const SECRET = process.env.NEXTAUTH_SECRET || "THIS_IS_A_FALLBACK_SECRET_CHANGE_IT_IN_PRODUCTION";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [credentials.username]
          );
          
          const user = result.rows[0];
          
          if (!user) {
            return null;
          }
          
          const passwordMatch = await compare(credentials.password, user.password);
          
          if (!passwordMatch) {
            return null;
          }
          
          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Error during login:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none", // Required for cross-site requests
        path: "/",
        secure: true, // Required for sameSite: "none"
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none", // Required for cross-site requests
        path: "/",
        secure: true // Required for sameSite: "none"
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);