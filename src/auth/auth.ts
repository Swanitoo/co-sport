import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Déterminer l'environnement
const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const csrfPrefix = useSecureCookies ? "__Host-" : "";

// Variable d'environnement dédiée pour le niveau de sécurité
// Par défaut, utiliser une sécurité élevée en production, basse en développement
const securityLevel =
  process.env.AUTH_SECURITY_LEVEL ||
  (process.env.NODE_ENV === "production" ? "high" : "low");
const securityChecks: ("pkce" | "state" | "nonce")[] =
  securityLevel === "high" ? ["pkce", "state", "nonce"] : ["state"];

export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Contrôler les vérifications de sécurité via la variable d'environnement
      checks: securityChecks,
      profile(profile) {
        // Suppression des logs en production
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
      // Utiliser une configuration HTTP personnalisée plus robuste
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      token: {
        url: "https://oauth2.googleapis.com/token",
        async request(context: any) {
          try {
            const params = {
              client_id: context.provider.clientId,
              client_secret: context.provider.clientSecret,
              grant_type: "authorization_code",
              redirect_uri: context.provider.callbackUrl,
              code: context.params.code,
            };

            const res = await fetch(context.provider.token?.url!, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(params),
              // Un timeout plus long pour gérer les problèmes de réseau
              signal: AbortSignal.timeout(15000),
            });

            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            return data;
          } catch (error) {
            throw error;
          }
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-ignore
        session.user.isAdmin = user.isAdmin;
        // @ts-ignore
        session.user.sex = user.sex;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Configuration de session améliorée
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 1 jour
  },
  // Configuration de cookies améliorée
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${csrfPrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900, // 15 minutes
      },
    },
  },
  debug: process.env.NODE_ENV !== "production",
  // Autoriser localhost en développement et en production pour les tests
  trustHost: true,
});
