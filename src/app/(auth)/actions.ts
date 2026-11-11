"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getVercelTrustedHosts, resolveActionOrigin } from "@/lib/app-origin";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

async function getValidatedEmailOrigin(): Promise<string> {
  const headerList = await headers();
  return resolveActionOrigin({
    headerOrigin: headerList.get("origin"),
    configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelHosts: getVercelTrustedHosts(),
  });
}

export type AuthActionResult = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
};

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .max(72, "Password must be 72 characters or fewer"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Password must be at least 10 characters long")
      .max(72, "Password must be 72 characters or fewer"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function signupAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  const validation = signupSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createClient();
  const origin = await getValidatedEmailOrigin();

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      success: false,
      errors: {
        general: error.message,
      },
    };
  }

  return {
    success: true,
    message: "Check your email to confirm.",
  };
}

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const rawRedirect =
    (formData.get("redirectedFrom") as string) || "/dashboard";

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      errors: {
        general: error.message,
      },
    };
  }

  redirect(safeRedirectPath(rawRedirect, "/dashboard"));
}

export async function forgotPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string) || "";

  const validation = forgotPasswordSchema.safeParse({ email });
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email?.[0],
      },
    };
  }

  const supabase = await createClient();
  const origin = await getValidatedEmailOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return {
      success: false,
      errors: {
        general: error.message,
      },
    };
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const validation = resetPasswordSchema.safeParse({
    password,
    confirmPassword,
  });
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      errors: {
        general: error.message,
      },
    };
  }

  return {
    success: true,
    message: "Your password has been successfully updated.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
