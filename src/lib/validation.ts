import { z } from "zod";

/**
 * First error message per form field, from a zod error.
 * Issues on fields not listed in `fields` are reported under "general".
 */
export function firstErrors<K extends string>(
  error: z.ZodError,
  fields: readonly K[]
): Partial<Record<K | "general", string>> {
  const out: Partial<Record<K | "general", string>> = {};
  for (const issue of error.issues) {
    const path = String(issue.path[0] ?? "");
    const key = (fields as readonly string[]).includes(path)
      ? (path as K)
      : "general";
    out[key] ??= issue.message;
  }
  return out;
}

export const uuidSchema = z.string().uuid();
