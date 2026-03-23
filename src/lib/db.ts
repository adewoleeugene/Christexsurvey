import { neon, NeonQueryFunction } from "@neondatabase/serverless";

const baseSql = neon(process.env.DATABASE_URL!);

/** Wraps neon sql with a single retry on connection failure */
export const sql: NeonQueryFunction<false, false> = async (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  try {
    return await baseSql(strings, ...values);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("fetch failed") || msg.includes("ETIMEDOUT")) {
      // Retry once on cold start timeout
      return await baseSql(strings, ...values);
    }
    throw error;
  }
};
