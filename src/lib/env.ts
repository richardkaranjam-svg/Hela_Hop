import { z } from "zod";

const isServer = typeof window === "undefined";

const serverSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Safaricom Daraja (M-PESA)
  DARAJA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  DARAJA_CONSUMER_KEY: z.string().min(1),
  DARAJA_CONSUMER_SECRET: z.string().min(1),
  DARAJA_SHORTCODE: z.string().min(1),
  DARAJA_PASSKEY: z.string().min(1),

  // IntaSend
  INTASEND_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  INTASEND_PUBLISHABLE_KEY: z.string().min(1),
  INTASEND_SECRET_KEY: z.string().min(1),

  // Node runtime environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DARAJA_ENV: z.enum(["sandbox", "production"]).optional(),
  DARAJA_CONSUMER_KEY: z.string().optional(),
  DARAJA_CONSUMER_SECRET: z.string().optional(),
  DARAJA_SHORTCODE: z.string().optional(),
  DARAJA_PASSKEY: z.string().optional(),
  INTASEND_ENV: z.enum(["sandbox", "production"]).optional(),
  INTASEND_PUBLISHABLE_KEY: z.string().optional(),
  INTASEND_SECRET_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const rawEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  SUPABASE_URL:
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  SUPABASE_ANON_KEY:
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DARAJA_ENV: process.env.DARAJA_ENV,
  DARAJA_CONSUMER_KEY: process.env.DARAJA_CONSUMER_KEY,
  DARAJA_CONSUMER_SECRET: process.env.DARAJA_CONSUMER_SECRET,
  DARAJA_SHORTCODE: process.env.DARAJA_SHORTCODE,
  DARAJA_PASSKEY: process.env.DARAJA_PASSKEY,
  INTASEND_ENV: process.env.INTASEND_ENV,
  INTASEND_PUBLISHABLE_KEY: process.env.INTASEND_PUBLISHABLE_KEY,
  INTASEND_SECRET_KEY: process.env.INTASEND_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = isServer
  ? serverSchema.safeParse(rawEnv)
  : clientSchema.safeParse(rawEnv);

if (!parsed.success) {
  const formattedErrors = Object.entries(parsed.error.flatten().fieldErrors)
    .map(([name, errs]) => `  - ${name}: ${errs?.join(", ")}`)
    .join("\n");
  console.error(`❌ Invalid environment variables:\n${formattedErrors}`);
  throw new Error(`Invalid environment variables:\n${formattedErrors}`);
}

export type Env = z.infer<typeof serverSchema>;
export const env = parsed.data as Env;
