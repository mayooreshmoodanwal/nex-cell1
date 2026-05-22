import { NextRequest } from "next/server";
import { parseBody, ok, err, SetPasswordSchema } from "@/lib/validations";
import { rateLimitOtpVerify, rateLimitResponse } from "@/lib/rate-limit";
import { setPassword } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  // 1. Rate limit — prevent abuse (optional, fail gracefully if Redis not available)
  try {
    const rl = await rateLimitOtpVerify(request);
    if (!rl.success) return rateLimitResponse(rl);
  } catch (error) {
    console.warn("Rate limiting unavailable, continuing without it:", error);
  }

  // 2. Validate body
  const body = await parseBody(request, SetPasswordSchema);
  if (body instanceof Response) return body;

  // 3. Set password
  try {
    const result = await setPassword(
      body.email,
      body.otp,
      body.password,
      request
    );

    if (!result.success) {
      return err(result.error ?? "Failed to set password", 400);
    }

    return ok({
      message: "Password set successfully. You can now log in with your password.",
    });
  } catch (error) {
    console.error("Error in set-password:", error);
    return err("An error occurred while setting password. Please try again.", 500);
  }
}
