import { NextRequest } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth";
import { ok, err } from "@/lib/validations";
import { getCertificateById, deleteCertificate } from "@/lib/services/certificate.service";

// GET /api/certificates/[id] — get single certificate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  const cert = await getCertificateById(params.id);
  if (!cert) return err("Certificate not found", 404);

  // Non-admin/non-member can only view their own
  const isPrivileged = user.roles.includes("admin") || user.roles.includes("member") || user.roles.includes("treasurer");
  if (!isPrivileged && cert.userId !== user.id) {
    return err("You can only view your own certificates", 403);
  }

  return ok(cert);
}

// DELETE /api/certificates/[id] — delete certificate (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  if (!isAdmin(user)) {
    return err("Only admins can delete certificates.", 403);
  }

  const deleted = await deleteCertificate(params.id);
  if (!deleted) return err("Certificate not found", 404);

  return ok({ message: "Certificate deleted successfully" });
}
