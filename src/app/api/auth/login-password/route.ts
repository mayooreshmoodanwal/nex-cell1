import { NextRequest, NextResponse } from "next/server";
import { parseBody, ok, err, LoginPasswordSchema } from "@/lib/validations";
import { rateLimitPasswordLogin, rateLimitResponse } from "@/lib/rate-limit";
import { loginWithPassword } from "@/lib/services/auth.service";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // 1. Rate limit — prevent brute force (optional, fail gracefully if Redis not available)
  try {
    const rl = await rateLimitPasswordLogin(request);
    if (!rl.success) return rateLimitResponse(rl);
  } catch (error) {
    console.warn("Rate limiting unavailable, continuing without it:", error);
  }

  // 2. Validate body
  const body = await parseBody(request, LoginPasswordSchema);
  if (body instanceof Response) return body;

  // 3. Login with password
  try {
    const result = await loginWithPassword(
      body.email,
      body.password,
      request
    );

    if (!result.success) {
      return err(result.error ?? "Login failed", 401);
    }

    // 4. Build response with auth cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: "Welcome back!",
        },
      },
      { status: 200 }
    );

    setAuthCookies(response, {
      accessToken:  result.accessToken!,
      refreshToken: result.refreshToken!,
      csrfToken:    result.csrfToken!,
    });

    return response;
  } catch (error) {
    console.error("Error in login-password:", error);
    return err("An error occurred during login. Please try again.", 500);
  }
}
