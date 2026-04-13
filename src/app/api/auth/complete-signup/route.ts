import { NextRequest, NextResponse } from "next/server";
import { parseBody, ok, err, CompleteSignupSchema } from "@/lib/validations";
import { rateLimitOtpSend, rateLimitResponse } from "@/lib/rate-limit";
import { completeSignup } from "@/lib/services/auth.service";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // 1. Rate limit — prevent abuse (optional, fail gracefully if Redis not available)
  try {
    const rl = await rateLimitOtpSend(request);
    if (!rl.success) return rateLimitResponse(rl);
  } catch (error) {
    console.warn("Rate limiting unavailable, continuing without it:", error);
  }

  // 2. Validate body
  const body = await parseBody(request, CompleteSignupSchema);
  if (body instanceof Response) return body;

  // 3. Complete signup
  try {
    const result = await completeSignup(
      body.email,
      body.name,
      body.phone,
      body.otp,
      body.password,
      request
    );

    if (!result.success) {
      return err(result.error ?? "Signup failed", 400);
    }

    // 4. Build response with auth cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: "Welcome to NexCell! Your account has been created.",
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
    console.error("Error in complete-signup:", error);
    return err("An error occurred during signup. Please try again.", 500);
  }
}
