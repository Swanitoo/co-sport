import { CustomPrismaAdapter } from "@/lib/auth-adapter";
import { prisma } from "@/prisma";
import { AdapterUser } from "@auth/core/adapters";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import StravaProvider, { StravaProfile } from "next-auth/providers/strava";

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

// Interface pour étendre l'utilisateur avec nos champs personnalisés
interface CustomUser extends AdapterUser {
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  sex?: string | undefined;
  stravaConnected?: boolean;
}

// Interface pour le contexte de requête d'OAuth
interface OAuthTokenRequestContext {
  provider: {
    id: string;
    clientId: string;
    clientSecret: string;
    token?: {
      url: string;
    };
    callbackUrl?: string;
  };
  params: {
    code: string;
    [key: string]: string;
  };
  tokens?: {
    access_token: string;
    [key: string]: any;
  };
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Autoriser la liaison des comptes par email
      allowDangerousEmailAccountLinking: true,
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
        async request(context: OAuthTokenRequestContext) {
          try {
            // S'assurer que callbackUrl existe avant de l'utiliser
            const callbackUrl =
              context.provider.callbackUrl ||
              `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

            const params = {
              client_id: context.provider.clientId,
              client_secret: context.provider.clientSecret,
              grant_type: "authorization_code",
              redirect_uri: callbackUrl,
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
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      // Autoriser la liaison des comptes par email
      allowDangerousEmailAccountLinking: true,
      checks: securityChecks,
      authorization: {
        params: {
          scope: "read,activity:read",
          approval_prompt: "auto",
        },
      },
      // Configuration personnalisée et améliorée pour obtenir le token
      token: {
        url: "https://www.strava.com/api/v3/oauth/token",
        async request(context: OAuthTokenRequestContext) {
          try {
            console.log("Début échange du code d'autorisation Strava...");

            // Construction manuelle de la requête pour éviter les problèmes avec OAuth4WebAPI
            const response = await fetch(
              "https://www.strava.com/api/v3/oauth/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  client_id: context.provider.clientId,
                  client_secret: context.provider.clientSecret,
                  code: context.params.code,
                  grant_type: "authorization_code",
                }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `Strava token error (${response.status}):`,
                errorText
              );
              throw new Error(
                `Erreur lors de l'échange du code: ${response.status} - ${errorText}`
              );
            }

            const data = await response.json();
            console.log(
              "Réponse du token Strava reçue:",
              JSON.stringify(
                {
                  access_token: "***REDACTED***",
                  token_type: data.token_type,
                  expires_at: data.expires_at,
                  refresh_token: "***REDACTED***",
                  athlete: data.athlete
                    ? {
                        id: data.athlete.id,
                        name: `${data.athlete.firstname} ${data.athlete.lastname}`,
                      }
                    : null,
                },
                null,
                2
              )
            );

            // Retourner un format compatible avec NextAuth
            return {
              tokens: {
                access_token: data.access_token,
                token_type: data.token_type || "Bearer",
                expires_at: data.expires_at,
                refresh_token: data.refresh_token,
                athlete: data.athlete || null,
              },
            };
          } catch (error) {
            console.error("Erreur d'échange du token Strava:", error);
            throw error;
          }
        },
      },
      // Implémentation personnalisée pour récupérer le profil utilisateur
      userinfo: {
        url: "https://www.strava.com/api/v3/athlete",
        async request(context: { tokens: { access_token: string } }) {
          try {
            console.log("Récupération du profil utilisateur Strava...");
            // Utiliser le token obtenu précédemment pour récupérer les informations de l'utilisateur
            const response = await fetch(
              "https://www.strava.com/api/v3/athlete",
              {
                headers: {
                  Authorization: `Bearer ${context.tokens.access_token}`,
                },
              }
            );

            if (!response.ok) {
              console.error("Strava userinfo error status:", response.status);
              const errorText = await response.text();
              console.error("Strava userinfo error body:", errorText);
              throw new Error(
                `Erreur lors de la récupération du profil: ${response.status}`
              );
            }

            const data = await response.json();
            console.log(
              "Profil Strava récupéré:",
              JSON.stringify(data, null, 2)
            );
            return data;
          } catch (error) {
            console.error("Erreur de récupération du profil Strava:", error);
            throw error;
          }
        },
      },
      profile(profile) {
        // Extraction correcte de toutes les données du profil Strava
        return {
          id: profile.id.toString(),
          name:
            profile.firstname && profile.lastname
              ? `${profile.firstname} ${profile.lastname}`
              : undefined,
          email: null, // Strava ne fournit pas d'email
          image: profile.profile,
          stravaId: profile.id.toString(),
          stravaConnected: true,
          stravaCreatedAt: profile.created_at
            ? new Date(profile.created_at)
            : undefined,
          stravaPremium: profile.premium || profile.summit || false,
          sex: profile.sex,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          stravaWeight:
            typeof profile.weight === "number" && profile.weight > 0
              ? profile.weight
              : undefined,
        };
      },
      account(account) {
        return {
          ...account,
          providerAccountId: account.providerAccountId
            ? account.providerAccountId.toString()
            : "",
        };
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
        // @ts-ignore
        session.user.stravaConnected = user.stravaConnected;
        // @ts-ignore
        session.user.stravaLinkRefused = user.stravaLinkRefused;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "strava" && account.access_token) {
          const stravaProfile = profile as StravaProfile;
          // S'assurer que l'ID est converti en chaîne
          const stravaId = stravaProfile?.id
            ? stravaProfile.id.toString()
            : null;

          // Vérifier d'abord si l'utilisateur existe déjà par son ID interne
          const existingUser = user.id
            ? await prisma.user.findUnique({ where: { id: user.id } })
            : null;

          // Rechercher l'utilisateur par stravaId si pas trouvé par ID interne
          const userByStravaId =
            !existingUser && stravaId
              ? await prisma.user.findUnique({
                  where: { stravaId },
                })
              : null;

          // Cas 1: L'utilisateur existe déjà avec ce stravaId
          if (userByStravaId) {
            // Mettre à jour ses tokens
            await prisma.user.update({
              where: { id: userByStravaId.id },
              data: {
                stravaConnected: true,
                stravaToken: account.access_token,
                stravaRefreshToken: account.refresh_token,
                stravaTokenExpiresAt: account.expires_at
                  ? parseInt(account.expires_at.toString())
                  : undefined,
                // Mise à jour des informations du profil si nécessaire
                name:
                  userByStravaId.name ||
                  (stravaProfile?.firstname && stravaProfile?.lastname
                    ? `${stravaProfile.firstname} ${stravaProfile.lastname}`
                    : undefined),
                image: userByStravaId.image || stravaProfile?.profile,
                sex: userByStravaId.sex || stravaProfile?.sex,
                city: userByStravaId.city || stravaProfile?.city,
                state: userByStravaId.state || stravaProfile?.state,
                country: userByStravaId.country || stravaProfile?.country,
                stravaPremium: stravaProfile?.premium || stravaProfile?.summit,
                stravaWeight:
                  typeof stravaProfile?.weight === "number" &&
                  stravaProfile.weight > 0
                    ? stravaProfile.weight
                    : undefined,
                stravaCreatedAt: stravaProfile?.created_at
                  ? new Date(stravaProfile.created_at)
                  : undefined,
              },
            });

            // Remplacer l'ID utilisateur temporaire par celui existant
            user.id = userByStravaId.id;
            return true;
          }

          // Cas 2: L'utilisateur existe et on veut lier son compte Strava
          if (existingUser) {
            const customUser = user as CustomUser;
            await prisma.user.update({
              where: { id: user.id },
              data: {
                stravaConnected: true,
                stravaToken: account.access_token,
                stravaRefreshToken: account.refresh_token,
                stravaTokenExpiresAt: account.expires_at
                  ? parseInt(account.expires_at.toString())
                  : undefined,
                stravaId: stravaId, // Déjà converti en chaîne
                // Mise à jour des informations du profil si nécessaire
                sex: customUser.sex || stravaProfile?.sex,
                city: customUser.city || stravaProfile?.city,
                state: customUser.state || stravaProfile?.state,
                country: customUser.country || stravaProfile?.country,
                stravaPremium: stravaProfile?.premium || stravaProfile?.summit,
                stravaWeight:
                  typeof stravaProfile?.weight === "number" &&
                  stravaProfile.weight > 0
                    ? stravaProfile.weight
                    : undefined,
                stravaCreatedAt: stravaProfile?.created_at
                  ? new Date(stravaProfile.created_at)
                  : undefined,
              },
            });
            return true;
          }

          // Cas 3: Nouvel utilisateur avec Strava comme premier login
          // On ne fait rien ici, AuthJS va créer l'utilisateur avec les données du profil
          // Les champs personnalisés viennent de la fonction profile() dans le provider
          console.log(
            "Nouvel utilisateur avec Strava, création automatique par AuthJS"
          );
          return true;
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de l'authentification:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Ajouter les données Strava au token
      if (account?.provider === "strava" && user) {
        token.stravaConnected = true;
        token.stravaId = account.providerAccountId;
      }
      return token;
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
