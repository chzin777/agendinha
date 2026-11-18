import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { username } from "better-auth/plugins";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured for authentication.");
}

const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
if (!secret || secret.length < 32) {
  throw new Error("Set BETTER_AUTH_SECRET to a random value of at least 32 characters.");
}

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
if (!baseURL) {
  throw new Error("BETTER_AUTH_URL must be configured in production.");
}

declare global {
  var authPool: Pool | undefined;
}

export const authPool =
  globalThis.authPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.authPool = authPool;
}

export const auth = betterAuth({
  appName: "Agendinha",
  baseURL,
  secret,
  database: authPool,
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.AUTH_BOOTSTRAP_MODE !== "true",
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  plugins: [
    username({
      immutableUsername: true,
      minUsernameLength: 3,
      maxUsernameLength: 32,
    }),
  ],
});

export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function requireAuth(request: Request): Promise<Response | null> {
  const session = await getSession(request.headers);
  return session
    ? null
    : Response.json({ error: "Unauthorized" }, { status: 401 });
}
