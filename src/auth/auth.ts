import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
import { env } from "@/env"
import { stripe } from "@/stripe"
 
export const { 
  handlers, 
  auth: baseAuth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  theme: {
    logo: "/icon.png"
  },
  providers: [
    Google({ 
      clientId: env.GOOGLE_CLIENT_ID, 
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    createUser: async (message) => {
      const userId = message.user.id
      const userEmail = message.user.email
      
      if (!userEmail || !userId) {
        return
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