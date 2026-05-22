import { NextRequest } from "next/server";
import { parseBody, ok, err, LookupEmailSchema } from "@/lib/validations";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate body
    const body = await parseBody(request, LookupEmailSchema);
    if (body instanceof Response) return body;

    const normalizedEmail = body.email.toLowerCase().trim();

    // 2. Check if user exists — include passwordHash to determine flow
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    // Return the appropriate flow based on user state
    if (!user) {
      // New user — needs to complete signup
      return ok({
        flow: "signup",
        message: "Please complete your signup",
      });
    }

    // Existing user WITH password → password login
    if (user.passwordHash) {
      return ok({
        flow: "password_login",
        message: "Welcome back! Please enter your password",
        data: {
          name: user.name,
        },
      });
    }

    // Existing user WITHOUT password → needs to set one via OTP
    return ok({
      flow: "set_password",
      message: "Please set a password for your account",
      data: {
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error in lookup-email:", error);
    return err("An error occurred. Please try again.", 500);
  }
}
