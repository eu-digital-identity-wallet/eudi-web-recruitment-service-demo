// src/env.ts
import { z } from "zod";

/** Server-only env (no NEXT_PUBLIC_ here) */
const server = z.object({
  POSTGRES_CONNECTION_STRING: z.string(),
  VERIFIER_API_URL: z.string().url(),
  ISSUER_API_URL: z.string().url(),
  KEYSTORE_FILE: z.string(),
  KEYSTORE_PASS: z.string(),
  KEYSTORE_ALIAS: z.string(),
});

/** Client-exposed env (must be prefixed with NEXT_PUBLIC_) */
const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_URI: z.string().url(),
});

/** Build a single shape that contains both */
const merged = server.merge(client);

/** Collect runtime env from process.env */
const runtimeEnv: Record<
  keyof z.infer<typeof merged>,
  string | undefined
> = {
  POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
  VERIFIER_API_URL: process.env.VERIFIER_API_URL,
  ISSUER_API_URL: process.env.ISSUER_API_URL,
  KEYSTORE_FILE: process.env.KEYSTORE_FILE,
  KEYSTORE_PASS: process.env.KEYSTORE_PASS,
  KEYSTORE_ALIAS: process.env.KEYSTORE_ALIAS,

  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URI: process.env.NEXT_PUBLIC_APP_URI,
};

const isServer = typeof window === "undefined";

/** Validate (server validates all, client validates only client shape) */
const parsed = isServer
  ? merged.safeParse(runtimeEnv)
  : client.safeParse(runtimeEnv);

if (!parsed.success) {
  // Show precise errors in dev
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

/** Strongly-typed env with a guard: client cannot access server vars */
type Merged = z.infer<typeof merged>;
const data = parsed.data as Merged;

export const env = new Proxy(data, {
  get(target, prop: string) {
    // Disallow server vars on the client
    if (!isServer && !prop.startsWith("NEXT_PUBLIC_")) {
      throw new Error(
        process.env.NODE_ENV === "production"
          ? "❌ Attempted to access a server-side environment variable on the client"
          : `❌ Attempted to access server-side environment variable '${prop}' on the client`
      );
    }
    // @ts-expect-error — index signature via Proxy
    return target[prop];
  },
}) as Merged;
