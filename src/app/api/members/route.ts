import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, userRoles } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { ok, err } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Determine the sorting/filtering requirements (if any)
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        linkedinUrl: users.linkedinUrl,
        directoryRole: users.directoryRole,
      })
      .from(users)
      .where(and(eq(users.showInDirectory, true), eq(users.isDeleted, false)))
      .orderBy(desc(users.createdAt));

    // Also get their roles so we can display main title
    const formattedMembers = await Promise.all(
      members.map(async (member) => {
        const roles = await db
          .select({ role: userRoles.role })
          .from(userRoles)
          .where(and(eq(userRoles.userId, member.id), isNull(userRoles.revokedAt)));

        return {
          ...member,
          roles: roles.map((r) => r.role),
        };
      })
    );

    return ok(formattedMembers);
  } catch (error) {
    console.error("Failed to fetch public members", error);
    return err("Internal Server Error", 500);
  }
}
