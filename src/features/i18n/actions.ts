"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const languageSchema = z.enum(["en", "sw"]);

/**
 * Action to switch language on public pages.
 */
export async function setLanguageAction(lang: "en" | "sw") {
  // The TypeScript type is not checked at runtime: anyone can call this.
  const parsed = languageSchema.safeParse(lang);
  if (!parsed.success) return;

  const cookieStore = await cookies();
  cookieStore.set("hela_lang", parsed.data, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}
