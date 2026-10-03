import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  user: {
    additionalFields: {
      group: { type: "string", defaultValue: "customer", input: false },
      adminRole: {
        type: ["general", "sales_rep", "operations"] as const,
        required: false,
        input: false,
      },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7 },
});
