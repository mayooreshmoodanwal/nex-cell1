import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, err } from "@/lib/validations";

// POST /api/admin/members — Add or update a user's directory profile
export async function POST(request: NextRequest) {
  const admin = requireAuth(request);
  if (admin instanceof Response) return admin;
  
  // Actually, any user can reach here but the middleware blocks non-admins.
  const body = await request.json();
  const { userId, showInDirectory, bio, linkedinUrl, avatarUrl, directoryRole } = body;

  if (!userId) return err("User ID is required", 400);

  try {
    const [updated] = await db
      .update(users)
      .set({
        showInDirectory: showInDirectory ?? true,
        ...(bio !== undefined && { bio }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(directoryRole !== undefined && { directoryRole })
      })
      .where(eq(users.id, userId))
      .returning();

    return ok(updated);
  } catch (error) {
    console.error("Admin member update failed", error);
    return err("Failed to update directory profile", 500);
  }
}
