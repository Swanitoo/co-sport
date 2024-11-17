import { env } from "@/env";
import { prisma } from "@/prisma";
import { stripe } from "@/stripe";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Strava from "next-auth/providers/strava";

export const {
  handlers,
  auth: baseAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  theme: {
    logo: "/opengraph-image.png",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    // Strava({
    //   clientId: process.env.AUTH_STRAVA_ID!,
    //   clientSecret: process.env.AUTH_STRAVA_SECRET!,
    //   authorization: {
    //     url: "https://www.strava.com/oauth/authorize",
    //     params: {
    //       scope: "read,activity:read_all",
    //     },
    //   },
    //   async profile(profile) {
    //     profile.id = String(profile.id);
    //     return {
    //       id: profile.id,
    //       name: profile.username || `${profile.firstname} ${profile.lastname}`,
    //       bio: profile.bio || null,
    //       city: profile.city || null,
    //       state: profile.state || null,
    //       country: profile.country || null,
    //       sex: profile.sex || null,
    //       image: profile.profile_medium || null,
    //       updatedAt: new Date(),
    //     };
    //   },
    // }),
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      if (account.provider === "strava") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              bio: existingUser.bio || profile.bio,
              city: existingUser.city || profile.city,
              state: existingUser.state || profile.state,
              country: existingUser.country || profile.country,
              sex: existingUser.sex || profile.sex,
            },
          });
        }
      }
      return true;
    },
  },

  events: {
    createUser: async (message) => {
      const userId = message.user.id;
      const userEmail = message.user.email;

      if (!userEmail || !userId) {
        return;
      }

      const stripeCustomer = await stripe.customers.create({
        name: message.user.name ?? "",
        email: userEmail,
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
      });
    },
  },
});
