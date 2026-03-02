import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          console.log('[NextAuth] Authenticating with backend:', BACKEND_URL);
          
          // Call the backend API for authentication
          const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('[NextAuth] Backend auth failed:', data);
            throw new Error(data.message || 'Authentication failed');
          }

          // Backend returns: { status: 'success', data: { user, accessToken, refreshToken } }
          if (data.status !== 'success' || !data.data) {
            console.error('[NextAuth] Invalid response format:', data);
            throw new Error('Invalid response from backend');
          }

          const { user, accessToken, refreshToken } = data.data;

          if (!user || !accessToken) {
            console.error('[NextAuth] Missing user or accessToken in response');
            throw new Error('Invalid response from backend');
          }

          console.log('[NextAuth] Authentication successful:', user.email, 'Role:', user.role);

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            jurisdiction: user.jurisdiction,
            token: accessToken, // Store the backend JWT token
          };
        } catch (error: any) {
          console.error('[NextAuth] Auth error:', error.message);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};