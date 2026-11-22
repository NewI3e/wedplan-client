import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const client = new MongoClient(process.env.DB_URI as string)
const db = client.db("wedplandb")

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: { type: "string", required: false, input: true },
      city: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
      businessName: { type: "string", required: false, input: true },
      website: { type: "string", required: false, input: true },
      weddingDate: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role === "vendor" ? "vendor" : "customer"
          return { data: { ...user, role } }
        },
      },
      update: {
        before: async (user) => {
          const data: Record<string, unknown> = { ...user }
          delete data.role
          return { data }
        },
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
})
