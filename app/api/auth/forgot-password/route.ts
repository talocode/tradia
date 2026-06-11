// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabase } from "@/utils/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/mailer";

type ForgotRequestBody = { email?: unknown };

function asString(v: unknown): string {
  return typeof v === "string" ? v : v === undefined || v === null ? "" : String(v);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ForgotRequestBody;
    const rawEmail = asString(body?.email).trim().toLowerCase();

    if (!rawEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // find user by email
    const supabase = createAdminSupabase();
    const { data: user, error: uerr } = await supabase
      .from("users")
      .select("id, email_verified")
      .eq("email", rawEmail)
      .maybeSingle();
    if (uerr) throw uerr;

    // Always respond with the same generic message (prevent enumeration).
    const genericResponse = {
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // create token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // store token
    const { error: tokenErr } = await supabase.from("password_reset_tokens").upsert({
      token,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });
    if (tokenErr) {
      console.error("Failed to store password reset token:", tokenErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // try sending email, but don't leak errors to client
    try {
      await sendPasswordResetEmail(rawEmail, token);
    } catch (mailErr: unknown) {
      // log but still return generic response
      console.error("Password reset email failed:", mailErr);
    }

    return NextResponse.json(genericResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Forgot password error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
