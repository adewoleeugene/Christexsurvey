import { neon } from "@neondatabase/serverless";

const baseSql = neon(process.env.DATABASE_URL!);

/** Wraps neon sql with a single retry on connection failure */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: typeof baseSql = (async (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  try {
    return await baseSql(strings, ...values);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("fetch failed") || msg.includes("ETIMEDOUT")) {
      return await baseSql(strings, ...values);
    }
    throw error;
  }
}) as typeof baseSql;
